'use client';

import { signIn } from 'next-auth/react';

export default function SignInButton() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 min-h-screen">
      <h1 className="text-xl">Please sign in to continue</h1>
      <button
        className="text-white transition shadow-inner shadow-slate-950 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 bg-neutral-700 hover:bg-neutral-800 focus:shadow-slate-600 border-neutral-700 hover:shadow-slate-600"
        onClick={() => signIn()}
      >
        Sign in
      </button>
    </div>
  );
}
