'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BASE_FLUISTERWEEK, type ExtraExercise, type FluisterDag } from '@/lib/fluisterweekData';
import { DATA_VERSION, STORAGE_KEYS } from '@/lib/storage';

const ADMIN_SESSION_KEY = 'fluisterweek-admin-session';
const REQUIRED_USER = 'Ann';
const REQUIRED_PASS = '1KwilInl0ggen';

const MAX_EXTRA_EXERCISES = 3;

const buildSoundCloudEmbed = (url: string) => {
  if (!url || !url.includes('soundcloud.com')) return '';
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    url
  )}&color=%23ff5500&inverse=false&auto_play=false&show_user=true`;
};

const normalizeExtraExercises = (extras: unknown): ExtraExercise[] => {
  if (!extras) return [];
  if (Array.isArray(extras)) {
    return extras
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'string') {
          return { title: '', url: item, displayType: 'download' as const };
        }
        if (typeof item === 'object') {
          const entry = item as Partial<ExtraExercise>;
          return {
            title: entry.title ?? '',
            url: entry.url ?? '',
            embedUrl:
              entry.embedUrl && entry.embedUrl.length > 0
                ? entry.embedUrl
                : entry.displayType === 'player'
                  ? buildSoundCloudEmbed(entry.url ?? '')
                  : undefined,
            displayType: entry.displayType === 'player' ? 'player' : 'download'
          } as ExtraExercise;
        }
        return null;
      })
      .filter((entry): entry is ExtraExercise => Boolean(entry));
  }
  return [];
};

type EditableExtra = {
  title: string;
  url: string;
  embedUrl: string;
  embedHtml: string;
  displayType: 'download' | 'player';
};

const pickEditable = (day: FluisterDag) => ({
  title: day.title,
  subtitle: day.subtitle,
  intro: day.intro,
  focus: day.focus,
  highlight: day.highlight,
  intention: day.intention,
  reflection: day.reflection,
  videoUrl: day.videoUrl,
  stepsText: day.steps.join('\n'),
  extraExercises: normalizeExtraExercises(day.extraExercises).map((exercise) => ({
    title: exercise.title ?? '',
    url: exercise.url ?? '',
    embedUrl: exercise.embedUrl ?? '',
    embedHtml: exercise.embedHtml ?? '',
    displayType: exercise.displayType ?? 'download'
  }))
});

type EditableDraft = ReturnType<typeof pickEditable>;
type DraftState = Record<number, EditableDraft>;

type WebhookConfig = {
  watched?: string;
  notWatched?: string;
};

type OverridesMap = Record<number, Partial<FluisterDag>>;

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [webhooks, setWebhooks] = useState<WebhookConfig>({});
  const [overrides, setOverrides] = useState<OverridesMap>({});
  const [drafts, setDrafts] = useState<DraftState>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSession = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    if (hasSession) {
      setIsLoggedIn(true);
    }
    const storedWebhooks = localStorage.getItem(STORAGE_KEYS.webhooks);
    if (storedWebhooks) {
      try {
        setWebhooks(JSON.parse(storedWebhooks));
      } catch (error) {
        console.error('Webhookconfig kon niet geladen worden', error);
      }
    }
    const storedOverrides = localStorage.getItem(STORAGE_KEYS.dayContent);
    if (storedOverrides) {
      try {
        setOverrides(JSON.parse(storedOverrides));
      } catch (error) {
        console.error('Dagcontent kon niet geladen worden', error);
      }
    }
  }, []);

  const saveWebhooks = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.webhooks, JSON.stringify(webhooks));
    setStatusMessage('Webhook-instellingen bewaard.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const toggleEditor = (index: number) => {
    setDrafts((prev) => {
      if (prev[index]) {
        const next = { ...prev };
        delete next[index];
        return next;
      }
      const base = {
        ...BASE_FLUISTERWEEK[index],
        ...overrides[index]
      } as FluisterDag;
      return {
        ...prev,
        [index]: pickEditable(base)
      };
    });
  };

  const updateDraftField = (index: number, field: keyof EditableDraft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const addExtraExercise = (index: number) => {
    setDrafts((prev) => {
      const draft = prev[index];
      if (!draft || draft.extraExercises.length >= MAX_EXTRA_EXERCISES) return prev;
      return {
        ...prev,
        [index]: {
          ...draft,
          extraExercises: [
            ...draft.extraExercises,
            {
              title: '',
              url: '',
              embedUrl: '',
              embedHtml: '',
              displayType: 'download'
            }
          ]
        }
      };
    });
  };

  const updateExtraExerciseField = (
    index: number,
    exerciseIndex: number,
    field: keyof EditableExtra,
    value: string
  ) => {
    setDrafts((prev) => {
      const draft = prev[index];
      if (!draft) return prev;
      const nextExercises = [...draft.extraExercises];
      nextExercises[exerciseIndex] = {
        ...nextExercises[exerciseIndex],
        [field]: value
      };
      return {
        ...prev,
        [index]: {
          ...draft,
          extraExercises: nextExercises
        }
      };
    });
  };

  const generateEmbedForExercise = (index: number, exerciseIndex: number) => {
    setDrafts((prev) => {
      const draft = prev[index];
      if (!draft) return prev;
      const target = draft.extraExercises[exerciseIndex];
      if (!target) return prev;
      const embed = target.url ? buildSoundCloudEmbed(target.url) : '';
      const nextExercises = [...draft.extraExercises];
      nextExercises[exerciseIndex] = {
        ...target,
        displayType: 'player',
        embedUrl: embed || target.embedUrl
      };
      return {
        ...prev,
        [index]: {
          ...draft,
          extraExercises: nextExercises
        }
      };
    });
  };

  const removeExtraExercise = (index: number, exerciseIndex: number) => {
    setDrafts((prev) => {
      const draft = prev[index];
      if (!draft) return prev;
      const nextExercises = draft.extraExercises.filter((_, idx) => idx !== exerciseIndex);
      return {
        ...prev,
        [index]: {
          ...draft,
          extraExercises: nextExercises
        }
      };
    });
  };

  const saveDay = (index: number) => {
    const draft = drafts[index];
    if (!draft) return;
    const payload: Partial<FluisterDag> = {
      title: draft.title,
      subtitle: draft.subtitle,
      focus: draft.focus,
      highlight: draft.highlight,
      intention: draft.intention,
  reflection: draft.reflection,
      intro: draft.intro,
      videoUrl: draft.videoUrl,
      steps: draft.stepsText
        .split('\n')
        .map((step) => step.trim())
        .filter(Boolean)
    };
    const sanitizedExtras = draft.extraExercises
      .map((exercise) => {
        const title = exercise.title.trim();
        const url = exercise.url.trim();
        let embedUrl = exercise.embedUrl?.trim() ?? '';
        let embedHtml = exercise.embedHtml?.trim() ?? '';
        const displayType = exercise.displayType || 'download';
        if (displayType === 'player' && embedHtml) {
          embedUrl = '';
        } else if (displayType === 'player' && (!embedUrl || embedUrl.length === 0)) {
          embedUrl = buildSoundCloudEmbed(url);
        }
        if (displayType !== 'player') {
          embedHtml = '';
          if (!url) return null;
        }
        if (displayType === 'player' && !embedHtml && !embedUrl) {
          return null;
        }
        return {
          title,
          url,
          embedUrl,
          embedHtml,
          displayType
        } as ExtraExercise;
      })
      .filter((exercise): exercise is ExtraExercise => Boolean(exercise))
      .slice(0, MAX_EXTRA_EXERCISES);
    payload.extraExercises = sanitizedExtras.length ? sanitizedExtras : undefined;
    setOverrides((prev) => {
      const next = { ...prev, [index]: payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.dayContent, JSON.stringify(next));
        localStorage.setItem(STORAGE_KEYS.dataVersion, DATA_VERSION);
      }
      return next;
    });
    setStatusMessage(`Dag ${index + 1} bewaard.`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const resetDay = (index: number) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[index];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.dayContent, JSON.stringify(next));
      }
      return next;
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setStatusMessage(`Dag ${index + 1} teruggezet naar origineel.`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username === REQUIRED_USER && password === REQUIRED_PASS) {
      setIsLoggedIn(true);
      setLoginError('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      }
    } else {
      setLoginError('Onjuiste gegevens. Probeer opnieuw.');
    }
  };

  const currentDays = useMemo(
    () => BASE_FLUISTERWEEK.map((day, index) => ({ ...day, ...overrides[index] })),
    [overrides]
  );

  const testWebhook = async (index: number, type: keyof WebhookConfig) => {
    const url = webhooks[type];
    if (!url) {
      setTestMessage('Geen webhook ingesteld voor deze actie.');
      setTimeout(() => setTestMessage(''), 2500);
      return;
    }
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ day: index + 1, type, triggeredAt: new Date().toISOString() })
      });
      setTestMessage(`Test verzonden voor dag ${index + 1} (${type}).`);
    } catch (error) {
      setTestMessage('Verzenden mislukt. Zie console.');
      console.error(error);
    } finally {
      setTimeout(() => setTestMessage(''), 2500);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#e6d5c0] to-[#fdf8f1] px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-5 rounded-3xl bg-white/80 p-8 shadow-2xl">
          <div>
            <p className="text-sm uppercase tracking-wide text-accent-sage">Admin</p>
            <h1 className="text-3xl font-semibold text-[#2b170e]">Fluisterweek beheer</h1>
            <p className="text-sm text-[#5b4337]">Log in om webhooks en content aan te passen.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#4d372c]" htmlFor="username">
              Gebruikersnaam
            </label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#4d372c]" htmlFor="password">
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
              autoComplete="current-password"
            />
          </div>
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button className="w-full rounded-2xl bg-accent-coral px-4 py-2 font-semibold text-white" type="submit">
            Inloggen
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header className="rounded-3xl bg-white/80 p-6 shadow">
        <p className="text-sm uppercase tracking-wide text-accent-sage">Beheer</p>
        <h1 className="text-4xl font-semibold text-[#2b170e]">De Fluisterweek · Admin</h1>
        <p className="text-sm text-[#5b4337]">Werk webhooks bij, test triggers en overschrijf de daginhoud.</p>
        {statusMessage && <p className="mt-2 text-sm text-accent-moss">{statusMessage}</p>}
        {testMessage && <p className="text-sm text-accent-coral">{testMessage}</p>}
      </header>

      <section className="rounded-3xl bg-white/70 p-6 shadow">
        <h2 className="text-2xl font-semibold text-[#2b170e]">Webhook-instellingen</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[#4d372c]">
            URL voor “gekeken”
            <input
              className="mt-2 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
              value={webhooks.watched ?? ''}
              onChange={(event) => setWebhooks((prev) => ({ ...prev, watched: event.target.value }))}
              placeholder="https://..."
            />
          </label>
          <label className="text-sm text-[#4d372c]">
            URL voor “nog niet gekeken”
            <input
              className="mt-2 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
              value={webhooks.notWatched ?? ''}
              onChange={(event) => setWebhooks((prev) => ({ ...prev, notWatched: event.target.value }))}
              placeholder="https://..."
            />
          </label>
        </div>
        <button
          className="mt-4 rounded-2xl bg-accent-coral px-5 py-2 text-sm font-semibold text-white"
          onClick={saveWebhooks}
        >
          Bewaar webhooks
        </button>
      </section>

      <section className="space-y-5">
        {currentDays.map((day, index) => {
          const isEditing = Boolean(drafts[index]);
          const draft = drafts[index];
          return (
            <article key={day.title} className="rounded-3xl border border-[#f0dfce] bg-white/80 p-6 shadow">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-accent-sage">Dag {index + 1}</p>
                  <h3 className="text-2xl font-semibold text-[#2b170e]">{day.title}</h3>
                  <p className="text-sm text-[#5b4337]">{day.subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    className="rounded-2xl border border-accent-coral/40 px-4 py-2 text-accent-coral"
                    onClick={() => toggleEditor(index)}
                  >
                    {isEditing ? 'Sluit editor' : 'Bewerk'}
                  </button>
                  <button
                    className="rounded-2xl border border-accent-sage/40 px-4 py-2 text-accent-sage"
                    onClick={() => testWebhook(index, 'watched')}
                  >
                    Test “gekeken”
                  </button>
                  <button
                    className="rounded-2xl border border-accent-sage/40 px-4 py-2 text-accent-sage"
                    onClick={() => testWebhook(index, 'notWatched')}
                  >
                    Test “nog niet”
                  </button>
                </div>
              </div>

              {isEditing && draft && (
                <div className="mt-6 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm text-[#4d372c]">
                      Titel
                      <input
                        className="mt-1 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
                        value={draft.title}
                        onChange={(event) => updateDraftField(index, 'title', event.target.value)}
                      />
                    </label>
                    <label className="text-sm text-[#4d372c]">
                      Subtitel
                      <input
                        className="mt-1 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
                        value={draft.subtitle}
                        onChange={(event) => updateDraftField(index, 'subtitle', event.target.value)}
                      />
                    </label>
                  </div>
                  <label className="text-sm text-[#4d372c]">
                    Intro (korte alinea)
                    <textarea
                      className="mt-1 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
                      rows={3}
                      value={draft.intro}
                      onChange={(event) => updateDraftField(index, 'intro', event.target.value)}
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm text-[#4d372c]">
                      Focus
                      <input
                        className="mt-1 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
                        value={draft.focus}
                        onChange={(event) => updateDraftField(index, 'focus', event.target.value)}
                      />
                    </label>
                    <label className="text-sm text-[#4d372c]">
                      Highlight
                      <input
                        className="mt-1 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
                        value={draft.highlight}
                        onChange={(event) => updateDraftField(index, 'highlight', event.target.value)}
                      />
                    </label>
                  </div>
                  <label className="text-sm text-[#4d372c]">
                    Intentie
                    <textarea
                      className="mt-1 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
                      rows={3}
                      value={draft.intention}
                      onChange={(event) => updateDraftField(index, 'intention', event.target.value)}
                    />
                  </label>
                  <label className="text-sm text-[#4d372c]">
                    Reflectie
                    <textarea
                      className="mt-1 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
                      rows={3}
                      value={draft.reflection}
                      onChange={(event) => updateDraftField(index, 'reflection', event.target.value)}
                    />
                  </label>
                  <label className="text-sm text-[#4d372c]">
                    Video URL
                    <input
                      className="mt-1 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
                      value={draft.videoUrl}
                      onChange={(event) => updateDraftField(index, 'videoUrl', event.target.value)}
                      placeholder="https://www.youtube.com/..."
                    />
                  </label>
                  <label className="text-sm text-[#4d372c]">
                    Steps (één per lijn)
                    <textarea
                      className="mt-1 w-full rounded-2xl border border-[#e2cdb8] bg-white/70 px-4 py-2"
                      rows={6}
                      value={draft.stepsText}
                      onChange={(event) => updateDraftField(index, 'stepsText', event.target.value)}
                    />
                  </label>
                  <div className="rounded-2xl border border-[#e2cdb8] bg-white/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#4d372c]">Extra oefeningen (max {MAX_EXTRA_EXERCISES})</p>
                      <button
                        type="button"
                        disabled={draft.extraExercises.length >= MAX_EXTRA_EXERCISES}
                        onClick={() => addExtraExercise(index)}
                        className="text-sm text-accent-coral disabled:opacity-40"
                      >
                        Voeg oefening toe
                      </button>
                    </div>
                    <div className="mt-3 space-y-3 text-sm text-[#4d372c]">
                      {draft.extraExercises.length === 0 && (
                        <p className="text-xs text-[#7a6457]">Nog geen extra oefeningen toegevoegd.</p>
                      )}
                      {draft.extraExercises.map((exercise, exerciseIndex) => (
                        <div key={`${exerciseIndex}-${index}`} className="space-y-2 rounded-2xl border border-[#ead8c7] bg-white/70 p-3">
                          <div className="flex gap-2">
                            <input
                              value={exercise.title}
                              onChange={(event) =>
                                updateExtraExerciseField(index, exerciseIndex, 'title', event.target.value)
                              }
                              placeholder="Titel"
                              className="flex-1 rounded-2xl border border-[#e2cdb8] bg-white px-3 py-2"
                            />
                            <button
                              type="button"
                              onClick={() => removeExtraExercise(index, exerciseIndex)}
                              className="text-xs text-[#a86b5d]"
                            >
                              Verwijder
                            </button>
                          </div>
                          <input
                            value={exercise.url}
                            onChange={(event) => updateExtraExerciseField(index, exerciseIndex, 'url', event.target.value)}
                            placeholder="Link (SoundCloud, download...)"
                            className="w-full rounded-2xl border border-[#e2cdb8] bg-white px-3 py-2"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={exercise.displayType}
                              onChange={(event) =>
                                updateExtraExerciseField(
                                  index,
                                  exerciseIndex,
                                  'displayType',
                                  event.target.value as EditableExtra['displayType']
                                )
                              }
                              className="rounded-2xl border border-[#e2cdb8] bg-white px-3 py-2 text-sm"
                            >
                              <option value="download">Downloadlink</option>
                              <option value="player">Audio player</option>
                            </select>
                            {exercise.displayType === 'player' && (
                              <button
                                type="button"
                                onClick={() => generateEmbedForExercise(index, exerciseIndex)}
                              className="text-xs text-accent-coral"
                            >
                              SoundCloud embed
                            </button>
                          )}
                        </div>
                          {exercise.displayType === 'player' ? (
                            <div className="space-y-2">
                              <input
                                value={exercise.embedUrl}
                                onChange={(event) =>
                                  updateExtraExerciseField(index, exerciseIndex, 'embedUrl', event.target.value)
                                }
                                placeholder="Optioneel: embed URL"
                                className="w-full rounded-2xl border border-[#e2cdb8] bg-white px-3 py-2"
                              />
                              <textarea
                                value={exercise.embedHtml}
                                onChange={(event) =>
                                  updateExtraExerciseField(index, exerciseIndex, 'embedHtml', event.target.value)
                                }
                                placeholder="Plak hier een volledige embed code (bijv. iframe)"
                                rows={3}
                                className="w-full rounded-2xl border border-[#e2cdb8] bg-white px-3 py-2 text-xs"
                              />
                            </div>
                          ) : (
                            <input
                              value={exercise.embedUrl}
                              onChange={(event) =>
                                updateExtraExerciseField(index, exerciseIndex, 'embedUrl', event.target.value)
                              }
                              placeholder="Optioneel: embed URL"
                              className="w-full rounded-2xl border border-[#e2cdb8] bg-white px-3 py-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => saveDay(index)}
                      className="rounded-2xl bg-accent-coral px-5 py-2 text-sm font-semibold text-white"
                    >
                      Opslaan
                    </button>
                    <button
                      onClick={() => resetDay(index)}
                      className="rounded-2xl border border-accent-sage/30 px-5 py-2 text-sm text-accent-sage"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
