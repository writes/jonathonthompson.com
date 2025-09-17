'use client';

import useSWR from 'swr';
import { useEffect, useRef, useState } from 'react';

type Center = {
  id: string;
  name: string;
  distance?: number;
  address: string;
  lat: number;
  lng: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function CenterFinder(props: any) {
  const fields = props.fields;
  const [zip, setZip] = useState(fields?.defaultZip?.value ?? '');
  const { data, error, isLoading } = useSWR<Center[]>(
    zip ? `/api/centers?zip=${encodeURIComponent(zip)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const rootRef = useRef<HTMLDivElement>(null);

  // Lazy hydrate when visible (if embedding in static route)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e], o) => {
        if (e.isIntersecting) o.disconnect();
      },
      { rootMargin: '200px' }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="center-finder p-8 bg-gray-100">
      <form
        onSubmit={(e) => {
          e.preventDefault(); /* SWR auto-fires on zip state */
        }}
      >
        <label htmlFor="zip" className="block">
          Enter ZIP
        </label>
        <input
          id="zip"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          inputMode="numeric"
          className="border p-2"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      {isLoading && <p role="status">Finding centers…</p>}
      {error && (
        <p role="alert">
          Sorry, we couldn't load nearby centers. Please try again.
        </p>
      )}
      {data?.length ? (
        <ul aria-label="Nearby centers" className="mt-4">
          {data.map((c) => (
            <li key={c.id} className="border-b py-2">
              <b>{c.name}</b> — {c.address}{' '}
              {c.distance ? `(${c.distance.toFixed(1)} mi)` : ''}
              <a href={`/centers/${c.id}`} className="ml-2 text-blue-500">
                View
              </a>
            </li>
          ))}
        </ul>
      ) : !isLoading && zip ? (
        <p>No centers found.</p>
      ) : null}
    </div>
  );
}
