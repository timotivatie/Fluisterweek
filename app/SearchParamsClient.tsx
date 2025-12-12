"use client";

import { useSearchParams } from "next/navigation";

export default function SearchParamsClient() {
  const searchParams = useSearchParams();

  // jouw bestaande logica hier
  return (
    <div>
      {/* voorbeeld */}
      <p>{searchParams.get("test")}</p>
    </div>
  );
}