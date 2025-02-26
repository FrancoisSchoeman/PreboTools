'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const options = { passive: true };
    const scroll = () => {
      const { scrollY } = window;
      setScrollY(scrollY);
    };
    document.addEventListener('scroll', scroll, options);
    // remove event on unmount to prevent a memory leak
    return () => document.removeEventListener('scroll', scroll);
  }, []);

  if (scrollY < 100) {
    return null;
  }

  return (
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className="fixed bottom-4 right-4 bg-black text-white p-2 rounded-full"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
