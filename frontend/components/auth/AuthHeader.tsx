'use client';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthHeader() {
  const { data: session } = useSession();

  return (
    <>
      {session ? (
        <div>
          <button
            className="text-white transition shadow-inner shadow-slate-950 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 bg-neutral-700 hover:bg-neutral-800 focus:shadow-slate-600 border-neutral-700 hover:shadow-slate-600"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div>
          <button
            className="text-white transition shadow-inner shadow-slate-950 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 bg-neutral-700 hover:bg-neutral-800 focus:shadow-slate-600 border-neutral-700 hover:shadow-slate-600"
            onClick={() => signIn()}
          >
            Sign in
          </button>
        </div>
      )}
    </>
  );
}
