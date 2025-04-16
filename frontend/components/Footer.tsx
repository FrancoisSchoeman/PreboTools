'use client';

import Logo from './Logo';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="z-10 border-t dark:border-neutral-800 backdrop-blur-md shadow-sm bg-gradient-to-r from-neutral-50/50 to-neutral-300/50 dark:from-neutral-600/50 dark:to-neutral-950/50 py-4">
      <div className="container px-4 mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <Logo />

        <p className="text-center text-gray-700 dark:text-gray-300">
          © {new Date().getFullYear()} Prebo Digital
        </p>

        <p className="flex items-center text-gray-700 dark:text-gray-300">
          Made with <span className="text-red-500 mx-1">❤️</span> by
          <Link
            href="https://github.com/FrancoisSchoeman"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-500 hover:underline"
          >
            Francois Schoeman
          </Link>
        </p>
      </div>
    </footer>
  );
}
