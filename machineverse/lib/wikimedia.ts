/**
 * Resolve an image URL from Wikipedia/Wikimedia using the public REST API.
 * Returns null if nothing useful is found. Server-only.
 */
export async function fetchWikimediaImage(query: string): Promise<string | null> {
  if (!query) return null;
  const title = encodeURIComponent(query.trim().replace(/\s+/g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;

  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "MachineVerse/1.0 (educational)",
      },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
    };
    return (
      data.originalimage?.source ?? data.thumbnail?.source ?? null
    );
  } catch {
    return null;
  }
}

export async function fetchManyWikimediaImages(queries: string[]): Promise<string[]> {
  const results = await Promise.all(queries.map(fetchWikimediaImage));
  return results.filter((u): u is string => Boolean(u));
}
