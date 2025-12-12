'use client';
export const dynamic = "force-dynamic";
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { BASE_FLUISTERWEEK, type FluisterDag, type ExtraExercise } from '@/lib/fluisterweekData';
import { DATA_VERSION, STORAGE_KEYS } from '@/lib/storage';

const DAY_INTERVAL_MS = 24 * 60 * 60 * 1000;

type ProgressEntry = {
  watchedAt?: number;
  notWatchedSent?: number;
};

type ProgressMap = Record<number, ProgressEntry>;

type WebhookConfig = {
  watched?: string;
  notWatched?: string;
};

type DayOverrides = Record<number, Partial<FluisterDag>>;

const cn = (...classes: Array<string | undefined | null | false>) => classes.filter(Boolean).join(' ');

const formatStatusTime = (timestamp?: number) => {
  if (!timestamp) return 'nog niet afgerond';
  const date = new Date(timestamp);
  return `${date.toLocaleDateString('nl-BE')} om ${date.toLocaleTimeString('nl-BE', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('embed')) return url;
  const videoIdMatch = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/(.+)$/);
  const videoId = videoIdMatch ? videoIdMatch[1] : url;
  return `https://www.youtube.com/embed/${videoId}`;
};

const getStartOfDay = (value: number) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const formatDateOnly = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('nl-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

const trimDayTitle = (title: string, fallback: number) => title.replace(new RegExp(`^Dag ${fallback}\\s?·\\s?`, 'i'), '').trim();

const buildSoundCloudEmbed = (url: string) => {
  if (!url || !url.includes('soundcloud.com')) return '';
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    url
  )}&color=%23b47d6b&inverse=false&auto_play=false&show_user=true&visual=false`;
};

const normalizeExtraExercises = (extras: unknown): ExtraExercise[] => {
  if (!extras) return [];
  if (Array.isArray(extras)) {
    return extras
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'string') {
          return {
            title: '',
            url: item,
            embedUrl: undefined,
            displayType: 'download'
          } as ExtraExercise;
        }
        if (typeof item === 'object') {
          const ex = item as Partial<ExtraExercise>;
          const displayType = ex.displayType === 'player' ? 'player' : 'download';
          const url = ex.url?.trim() ?? '';
          const embedHtml = ex.embedHtml?.trim();
          const rawEmbed = ex.embedUrl?.trim();
          const embedUrl =
            rawEmbed && rawEmbed.length > 0
              ? rawEmbed
              : displayType === 'player'
                ? buildSoundCloudEmbed(url)
                : undefined;
          return {
            title: ex.title ?? '',
            url,
            embedUrl,
            embedHtml,
            displayType
          } as ExtraExercise;
        }
        return null;
      })
      .filter((entry): entry is ExtraExercise => Boolean(entry));
  }
  return [];
};

const getExerciseEmbedSrc = (exercise: ExtraExercise) => {
  if (exercise.displayType !== 'player') return '';
  if (exercise.embedUrl && exercise.embedUrl.length > 0) return exercise.embedUrl;
  return exercise.url ? buildSoundCloudEmbed(exercise.url) : '';
};

export default function HomePage() {
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [overrides, setOverrides] = useState<DayOverrides>({});
  const [webhooks, setWebhooks] = useState<WebhookConfig>({});
  const [activeDay, setActiveDay] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareNotes, setShareNotes] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [lockedDayIndex, setLockedDayIndex] = useState<number | null>(null);
  const [lockedPopover, setLockedPopover] = useState<{ top: number; left: number } | null>(null);
  const searchParams = useSearchParams();
  const startDay = useMemo(() => (startTimestamp ? getStartOfDay(startTimestamp) : null), [startTimestamp]);
  const getUnlockTimestamp = useCallback(
    (dayIndex: number) => (startDay === null ? null : startDay + dayIndex * DAY_INTERVAL_MS),
    [startDay]
  );
  const popoverPosition = useMemo(() => {
    if (!lockedPopover) return null;
    const width = 320;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : width + 32;
    const left = Math.max(16, Math.min(lockedPopover.left - width / 2, viewportWidth - width - 16));
    return {
      top: lockedPopover.top,
      left
    };
  }, [lockedPopover]);

  const closeLockedPopover = () => {
    setLockedDayIndex(null);
    setLockedPopover(null);
  };

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedStart = localStorage.getItem(STORAGE_KEYS.start);
    if (storedStart) {
      setStartTimestamp(Number(storedStart));
    } else {
      const freshStart = getStartOfDay(Date.now());
      localStorage.setItem(STORAGE_KEYS.start, String(freshStart));
      setStartTimestamp(freshStart);
    }

    const storedVersion = localStorage.getItem(STORAGE_KEYS.dataVersion);
    if (storedVersion !== DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.dayContent);
      localStorage.setItem(STORAGE_KEYS.dataVersion, DATA_VERSION);
    }

    const storedProgress = localStorage.getItem(STORAGE_KEYS.progress);
    if (storedProgress) {
      try {
        setProgress(JSON.parse(storedProgress));
      } catch (error) {
        console.error('Kon progressie niet lezen', error);
      }
    }

    const storedOverrides = localStorage.getItem(STORAGE_KEYS.dayContent);
    if (storedOverrides) {
      try {
        setOverrides(JSON.parse(storedOverrides));
      } catch (error) {
        console.error('Kon dagcontent niet lezen', error);
      }
    }

    const storedWebhooks = localStorage.getItem(STORAGE_KEYS.webhooks);
    if (storedWebhooks) {
      try {
        setWebhooks(JSON.parse(storedWebhooks));
      } catch (error) {
        console.error('Kon webhookconfig niet lezen', error);
      }
    }

    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.dayContent && event.newValue) {
        setOverrides(JSON.parse(event.newValue));
      }
      if (event.key === STORAGE_KEYS.webhooks && event.newValue) {
        setWebhooks(JSON.parse(event.newValue));
      }
      if (event.key === STORAGE_KEYS.progress && event.newValue) {
        setProgress(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    const dagParam = searchParams.get('dag');
    if (dagParam) {
      const parsed = Number(dagParam) - 1;
      if (!Number.isNaN(parsed)) {
        setActiveDay(Math.max(0, Math.min(parsed, BASE_FLUISTERWEEK.length - 1)));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!shareModalOpen) {
      setShareNotes('');
      setShareStatus('');
    }
  }, [shareModalOpen]);

  const updateProgress = useCallback((dayIndex: number, patch: Partial<ProgressEntry>) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        [dayIndex]: {
          ...prev[dayIndex],
          ...patch
        }
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const derivedDays = useMemo<FluisterDag[]>(() => {
    return BASE_FLUISTERWEEK.map((day, index) => {
      const override = overrides[index] ?? {};
      const merged = {
        ...day,
        ...override
      };
      merged.extraExercises = normalizeExtraExercises(merged.extraExercises);
      return merged;
    });
  }, [overrides]);

  const unlockedCount = useMemo(() => {
    if (!startTimestamp) return 1;
    const startDay = getStartOfDay(startTimestamp);
    const today = getStartOfDay(now);
    const daysPassed = Math.floor((today - startDay) / DAY_INTERVAL_MS);
    const unlocked = daysPassed + 1;
    return Math.max(1, Math.min(derivedDays.length, unlocked));
  }, [startTimestamp, now, derivedDays.length]);

  const triggerWebhook = useCallback(
    async (dayIndex: number, type: keyof WebhookConfig) => {
      const url = webhooks?.[type];
      if (!url || typeof fetch === 'undefined') return;
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            day: dayIndex + 1,
            type,
            triggeredAt: new Date().toISOString()
          })
        });
      } catch (error) {
        console.warn('Webhook mislukt', error);
      }
    },
    [webhooks]
  );

  useEffect(() => {
    if (startDay === null) return;
    const base = startDay;
    derivedDays.forEach((_, index) => {
      const availableAt = base + index * DAY_INTERVAL_MS;
      if (now - availableAt >= DAY_INTERVAL_MS) {
        const entry = progress[index];
        if (!entry?.watchedAt && !entry?.notWatchedSent) {
          triggerWebhook(index, 'notWatched');
          updateProgress(index, { ...entry, notWatchedSent: Date.now() });
        }
      }
    });
  }, [now, startDay, progress, derivedDays, triggerWebhook, updateProgress]);

  const handleMarkWatched = async (dayIndex: number) => {
    const entry = progress[dayIndex];
    if (entry?.watchedAt) {
      updateProgress(dayIndex, { watchedAt: undefined });
    } else {
      updateProgress(dayIndex, { watchedAt: Date.now(), notWatchedSent: undefined });
      await triggerWebhook(dayIndex, 'watched');
    }
  };

  const handleDaySelection = (index: number, unlocked: boolean, event?: ReactMouseEvent<HTMLButtonElement>) => {
    if (unlocked) {
      setActiveDay(index);
      setLockedDayIndex(null);
      setLockedPopover(null);
    } else {
      const rect = event?.currentTarget.getBoundingClientRect();
      if (rect) {
        setLockedPopover({
          top: rect.top + window.scrollY + rect.height + 8,
          left: rect.left + window.scrollX + rect.width / 2
        });
      } else {
        setLockedPopover(null);
      }
      setLockedDayIndex(index);
    }
  };

  const handleCompleteLesson = () => {
    handleMarkWatched(activeDay);
  };

  const handleShareSubmit = () => {
    const subject = encodeURIComponent(`Fluisterweek · Dag ${activeDay + 1}`);
    const body = encodeURIComponent(
      `Dag ${activeDay + 1} · ${derivedDays[activeDay].title}\n\n${shareNotes || 'Mijn reflectie:'}`
    );
    window.location.href = `mailto:annvangeert@icloud.com?subject=${subject}&body=${body}`;
    setShareStatus('We openen je e-mail met je notities.');
  };
  const handleLockedOverride = () => {
    if (lockedDayIndex !== null) {
      setActiveDay(lockedDayIndex);
      closeLockedPopover();
    }
  };

  const activeContent = derivedDays[activeDay];
  const lockedUnlockDate = lockedDayIndex !== null ? getUnlockTimestamp(lockedDayIndex) : null;

  return (
    <main className="min-h-screen bg-[#919668]">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <section className="grid gap-6 lg:grid-cols-[1.7fr,0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[36px] border border-[#f3dfd2] bg-gradient-to-br from-[#fff4ef] via-[#fdecec] to-[#f6e3d2] p-7 shadow-2xl shadow-[#e2caba]/50">
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#919668]">Fluisterend Lichaam</p>
                  <p className="text-4xl font-semibold text-[#2f2b1f] sm:text-5xl">De Fluisterweek</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[#919668]">
                    7-daagse transformatiereis: van ‘aan’ naar ‘aanwezig’
                  </p>
                </div>
                <div className="pt-2">
                  <h2 className="text-2xl font-semibold text-[#41281d] sm:text-3xl">{activeContent.title}</h2>
                  <p className="mt-1 text-base text-[#6a4e40]">{activeContent.subtitle}</p>
                  <p className="mt-3 text-base text-[#5f4638]">{activeContent.intro}</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-white/60 bg-[#fef8f0] shadow-inner">
                <iframe
                  className="aspect-video w-full"
                  src={getEmbedUrl(activeContent.videoUrl)}
                  title={activeContent.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCompleteLesson}
                  className="rounded-full bg-gradient-to-r from-[#919668] to-[#6d7a3d] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4f582a]/40 transition hover:translate-y-[-2px]"
                >
                  {progress[activeDay]?.watchedAt ? 'Reset' : 'Les afgerond'}
                </button>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="rounded-full border border-[#ff8252] bg-white/15 px-5 py-3 text-sm font-semibold text-[#364124] shadow-inner shadow-white/30 transition hover:bg-white/25"
                >
                  Deel je resultaten
                </button>
                <p className="text-xs text-[#6b4c3a]">Laatste afronding: {formatStatusTime(progress[activeDay]?.watchedAt)}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[28px] border border-[#efddc7] bg-white/80 p-6 shadow-lg">
                <p className="text-sm uppercase tracking-wide text-accent-moss">Oefeningen van vandaag</p>
                <ol className="mt-5 space-y-3">
                  {activeContent.steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-4">
                      <span className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f3f7e7] to-[#c2ce91] text-sm font-semibold text-[#2f3b1a] shadow-inner shadow-white/70 ring-1 ring-white/60">
                        {index + 1}
                      </span>
                      <div className="flex-1 rounded-2xl border border-[#efe2d3] bg-white/80 px-4 py-3 text-[#4c392c] shadow-sm">
                        {step}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-5">
                <div className="rounded-[28px] border border-[#efddc7] bg-white/80 p-5">
                  <p className="text-xs uppercase tracking-wide text-accent-sage">Focus</p>
                  <p className="mt-2 text-[#36251b]">{activeContent.focus}</p>
                </div>
                <div className="rounded-[28px] border border-[#efddc7] bg-white/80 p-5">
                  <p className="text-xs uppercase tracking-wide text-accent-sage">Highlight</p>
                  <p className="mt-2 text-lg text-[#36251b]">{activeContent.highlight}</p>
                </div>
                <div className="rounded-[28px] border border-[#efddc7] bg-white/80 p-5">
                  <p className="text-xs uppercase tracking-wide text-accent-sage">Intentie</p>
                  <p className="mt-2 text-[#4c392c]">{activeContent.intention}</p>
                </div>
                <div className="rounded-[28px] border border-[#efddc7] bg-white/80 p-5">
                  <p className="text-xs uppercase tracking-wide text-accent-sage">Reflectie</p>
                  <p className="mt-2 text-[#4c392c]">{activeContent.reflection}</p>
                </div>
                {activeContent.extraExercises?.length ? (
                  <div className="rounded-[28px] border border-[#efddc7] bg-white/80 p-5">
                    <p className="text-xs uppercase tracking-wide text-accent-sage">Herhaal de oefeningen</p>
                    <div className="mt-3 space-y-4 text-sm">
                      {activeContent.extraExercises.slice(0, 3).map((exercise, index) => {
                        const embedSrc = getExerciseEmbedSrc(exercise);
                        return (
                          <div key={`${exercise.title ?? 'exercise'}-${index}`} className="space-y-2">
                            <p className="text-base font-semibold text-[#3d2c22]">
                              {exercise.title || `Extra oefening ${index + 1}`}
                            </p>
                            {exercise.displayType === 'player' && (
                              <div className="overflow-hidden rounded-2xl border border-[#f2e3d3] bg-[#fff9f3]">
                                {exercise.embedHtml ? (
                                  <div
                                    className="soundcloud-embed"
                                    dangerouslySetInnerHTML={{ __html: exercise.embedHtml }}
                                  />
                                ) : embedSrc ? (
                                  <iframe
                                    src={embedSrc}
                                    className="h-24 w-full"
                                    allow="autoplay"
                                    title={exercise.title || `extra-oefening-${index + 1}`}
                                  />
                                ) : null}
                              </div>
                            )}
                            {exercise.url && (
                              <a
                                className="inline-flex items-center rounded-full border border-[#cdd9b1] px-4 py-2 text-sm font-semibold text-[#4c5f2b] hover:bg-[#f3f7ea]"
                                href={exercise.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {exercise.displayType === 'player' ? 'Open in SoundCloud' : 'Download oefening'}
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[#e6d7c4] bg-white/80 p-6 shadow-lg">
              <p className="text-sm uppercase tracking-wide text-accent-moss">Jouw ritme</p>
              <h2 className="text-3xl font-semibold text-[#2d2117]">Je bent bij dag {activeDay + 1}</h2>
              <p className="text-sm text-[#6b4c3a]">Selecteer een dag om de sessie te bekijken.</p>
              <div className="mt-5 flex flex-col gap-3">
                {derivedDays.map((day, index) => {
                  const entry = progress[index];
                  const unlocked = index < unlockedCount;
                  const statusIcon = unlocked ? (entry?.watchedAt ? '✓' : '○') : '🔒';
                  const trimmedTitle = trimDayTitle(day.title, index + 1);
                  return (
                    <button
                      key={day.title}
                      onClick={(event) => handleDaySelection(index, unlocked, event)}
                      className={cn(
                        'w-full rounded-2xl border px-4 py-3 text-left transition',
                        unlocked
                          ? index === activeDay
                            ? 'border-[#f6f2e4] bg-gradient-to-r from-[#f3f7ea] to-[#d4dfb2] text-[#2e271f] shadow-md'
                            : 'border-[#ead9c9] bg-white/90 text-[#4c3b2f] hover:border-[#c8dca6]'
                          : 'border border-dashed border-white/50 bg-white/10 text-white/70'
                      )}
                    >
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span className={unlocked ? 'text-[#2d271e]' : 'text-[#c8c19c]'}>Dag {index + 1}</span>
                        <span>{statusIcon}</span>
                      </div>
                      <p
                        className={cn(
                          'mt-1 text-sm font-semibold',
                          unlocked ? 'text-[#3d2c22]' : 'text-[#c3bb95]'
                        )}
                      >
                        {trimmedTitle}
                      </p>
                      <p className={cn('text-xs', unlocked ? 'text-[#4d3a2d]' : 'text-[#bcb489]')}>{day.focus}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>

        <div className="rounded-[32px] border border-[#ff8252] bg-white/80 p-6 text-center shadow-lg">
          <p className="text-base text-[#5f4736]">
            Wil je iets delen, heb je vragen of verlang je extra begeleiding? Laat het gerust weten.
          </p>
          <a
            className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#6d7a3d] to-[#a9be72] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#545e2c]/40 transition hover:translate-y-[-1px]"
            href="mailto:annvangeert@icloud.com?subject=Fluisterweek%20vraag%20of%20feedback"
          >
            Mail Ann
          </a>
        </div>
      </div>

      <footer className="border-t border-white/60 bg-gradient-to-r from-[#f5ede4] via-[#f8f3ec] to-[#f5ede4] py-6">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-[#957f6d]">
          © 2026 Ann van Geert · Fluisterend Lichaam
        </p>
      </footer>

      {lockedDayIndex !== null && popoverPosition && (
        <div className="fixed inset-0 z-40" onClick={closeLockedPopover}>
          <div
            className="absolute w-[min(90vw,320px)] rounded-[24px] border border-[#ead7c7] bg-[#fff7f0] p-4 shadow-2xl"
            style={{
              top: popoverPosition.top,
              left: popoverPosition.left
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm font-semibold text-[#3c2a20]">
              Dag {lockedDayIndex + 1} komt automatisch vrij op{' '}
              {lockedUnlockDate ? `${formatDateOnly(lockedUnlockDate)}` : 'de volgende ochtend'}.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={closeLockedPopover}
                className="rounded-full bg-gradient-to-r from-[#ff9c6d] to-[#ff8252] px-5 py-2 text-xs font-semibold text-white"
              >
                Ok
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleLockedOverride();
                }}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#a1593c] shadow-sm"
              >
                Nu bekijken
              </button>
            </div>
          </div>
        </div>
      )}

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-[32px] border border-[#f1dfc9] bg-[#fff8ef] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-[#2d2117]">Deel je resultaten</h3>
              <button onClick={() => setShareModalOpen(false)} className="text-sm text-[#6b4c3a]">
                Sluiten
              </button>
            </div>
            <p className="mt-2 text-sm text-[#6b4c3a]">
              Vertel Ann wat je voelde of stuur jezelf een reminder. We openen jouw mail-app met deze notities.
            </p>
            <textarea
              value={shareNotes}
              onChange={(event) => setShareNotes(event.target.value)}
              className="mt-4 w-full rounded-3xl border border-[#e7d2bd] bg-white/80 p-4 text-sm text-[#2d2117] focus:border-[#8aa15d] focus:outline-none"
              rows={6}
              placeholder="Vandaag ontdekte ik..."
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleShareSubmit}
                className="rounded-full bg-gradient-to-r from-[#6d7a3d] to-[#a9be72] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4f582a]/40"
              >
                Verstuur naar Ann
              </button>
              {shareStatus && <p className="text-sm text-accent-moss">{shareStatus}</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
