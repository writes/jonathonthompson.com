'use client';

import { useState } from 'react';

export function ConsentBanner() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
      <p className="mb-2">
        We use cookies to improve your experience. Do you consent?
      </p>
      <button
        onClick={() => {
          window.kcAnalytics!.consent = true;
          setShow(false);
        }}
        className="bg-green-500 px-4 py-2 rounded mr-2"
      >
        Accept
      </button>
      <button
        onClick={() => setShow(false)}
        className="bg-red-500 px-4 py-2 rounded"
      >
        Decline
      </button>
    </div>
  );
}
