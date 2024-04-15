"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Register() {
  const { push } = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    fetch("/api/registration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(() => push("/api/auth/signin"));
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={onSubmit}
        className="p-6 bg-zinc-900 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Register</h2>
        <div className="mb-4">
          <input
            className="w-full p-3 border border-zinc-700 bg-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            name="email"
            type="email"
            placeholder="jdoe@gmail.com"
          />
        </div>
        <div className="mb-6">
          <input
            className="w-full p-3 border border-zinc-700 bg-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            name="password"
            type="password"
            placeholder="Password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
