'use client';

import { Toast } from '@/components/toast';
import { useToast } from '@/hooks/use-toast';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Register() {
  const { push } = useRouter();
  const [isOpen, [open, close]] = useToast();
  const [isLoading, setLoading] = useState(false);

  const { data } = useSession();

  useEffect(() => {
    if (data?.user) {
      push('/');
    }
  }, [data]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    // @ts-ignore
    signIn('login', { ...data, callbackUrl: '/', redirect: false }).then(({ ok }) => {
      setLoading(false);

      if (!ok) return open();
      push('/');
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {isOpen && <Toast message="The username or password you entered is incorrect." type="error" onClose={close} />}
      <form onSubmit={onSubmit} className="p-6 bg-slate-900 border-t border-white/5 rounded-2xl shadow-lg max-w-md w-full flex flex-col gap-5">
        <div className="text-white">
          <h2 className="text-2xl font-semibold">Hello Again!</h2>
          <span className="text-slate-300">For the purpose of industry regulation, your details are required.</span>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-white" htmlFor="email">
            <span className="text-sm font-medium">Email</span>
            <input
              className="w-full p-3 border border-slate-800 bg-slate-950 rounded-lg placeholder:text-slate-600 shadow-inner"
              id="email"
              name="email"
              type="email"
              placeholder="jdoe@gmail.com"
            />
          </label>
          <label className="flex flex-col gap-1 text-white" htmlFor="password">
            <span className="text-sm font-medium">Password</span>
            <input
              className="w-full p-3 border border-slate-800 bg-slate-950 rounded-lg placeholder:text-slate-600 shadow-inner"
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            />
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <button
            disabled={isLoading}
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md border-l border-t border-r border-white/10 font-medium bg-gradient-to-t from-indigo-500 to-indigo-600 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Login
          </button>
          <span className="text-white">
            Don't have an account?{' '}
            <Link href={'/auth/register'} className="text-yellow-400 rounded-sm">
              Sign Up
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
