"use client";

import Link from "next/link";
import cv from "@techstark/opencv-js";
import { useEffect, useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { processImages } from "@/client/actions";
import { convertToBase64, base64ToImageElement } from "@/client/base64";

export default function Home() {
  const { data } = useSession();
  const [showUploadFields, setShowUploadFields] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);

  const handleCreateEvidence = () => {
    setShowUploadFields(true);
  };

  const OnProcess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowUploadFields(false);
    setFilesUploaded(false);

    const formData = new FormData(e.currentTarget);
    const frontFile = formData.get("frontID") as File;
    const backFile = formData.get("backID") as File;

    try {
      const frontIDBase64 = await convertToBase64(frontFile);
      const backIDBase64 = await convertToBase64(backFile);
      const frontIDimage = await base64ToImageElement(frontIDBase64);
      const backIDimage = await base64ToImageElement(backIDBase64);

      await processImages(frontIDimage, backIDimage);
    } catch (error) {
      console.error("Error processing files:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFilesUploaded(true);
    } else {
      setFilesUploaded(false);
    }
  };

  if (!data?.user)
    return (
      <main className="flex items-center justify-center min-h-screen">
        <button
          className="bg-indigo-600 text-white p-4"
          onClick={(e) => signIn()}
        >
          Sign in
        </button>

        <Link href={"/auth/register"} className="bg-indigo-600 text-white p-4">
          Sign up
        </Link>
      </main>
    );

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <form
        onSubmit={OnProcess}
        className="p-6 bg-zinc-900 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
          Create New Evidence
        </h2>
        {showUploadFields && (
          <div className="space-y-4">
            <input
              type="file"
              className="file:bg-blue-50 file:border file:border-blue-500 file:p-2 file:rounded-none file:text-sm file:font-semibold file:hover:bg-blue-100 w-full"
              name="frontID"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
            <input
              type="file"
              className="file:bg-blue-50 file:border file:border-blue-500 file:p-2 file:rounded-none file:text-sm file:font-semibold file:hover:bg-blue-100 w-full"
              name="backID"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
          </div>
        )}
        <button
          type="button"
          className="bg-green-500 hover:bg-green-700 text-white p-4 w-full mt-4"
          onClick={handleCreateEvidence}
        >
          Add Files
        </button>
        {filesUploaded && (
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-none shadow-xl transition duration-150 ease-in-out w-full mt-4"
          >
            Process Evidence
          </button>
        )}
      </form>
      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 absolute top-4 right-4"
        onClick={(e) => signOut()}
      >
        Logout
      </button>
    </div>
  );
}
