"use client";

import Link from "next/link";
import cv from "@techstark/opencv-js";
import { useEffect, useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { processImages, recognizeTextFromImage } from "@/client/dataProcessing";
import { convertToBase64, base64ToImageElement } from "@/client/base64";
import * as verification from "@/client/idVerification";

import { FrontID } from "@/client/frontID";
import { BackID } from "@/client/backID";

import dynamic from "next/dynamic";

import init, { age_proof_generation } from "@/static/wasm/age_generation_proof";

export default function Home() {
  const { data } = useSession();
  const [showUploadFields, setShowUploadFields] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);

  const handleCreateEvidence = () => {
    setShowUploadFields(true);
  };

  useEffect(() => {
    // (async () => {
    //   const wasm = (await import("@/static/wasm/age_verification_proof"))
    //     .default;

    //   const { age_proof_generation } = wasm;

    //   console.log(age_proof_generation);
    // })();

    console.log(age_proof_generation);
  }, []);

  const OnProcess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowUploadFields(false);
    setFilesUploaded(false);

    const formData = new FormData(e.currentTarget);
    const frontFile = formData.get("frontID") as File;
    const backFile = formData.get("backID") as File;

    try {
      const frontIdBase64 = await convertToBase64(frontFile);
      const backIdBase64 = await convertToBase64(backFile);
      const frontIdimage = await base64ToImageElement(frontIdBase64);
      const backIdimage = await base64ToImageElement(backIdBase64);

      const [canvasFront, canvasBack] = await processImages(
        frontIdimage,
        backIdimage
      );

      const frontIdText: string = await recognizeTextFromImage(canvasFront);
      const backIdText: string = await recognizeTextFromImage(canvasBack);

      const frontIdObject: FrontID = new FrontID(frontIdText);
      const backIdObject: BackID = new BackID(backIdText);

      console.log(frontIdObject.serialization());
      console.log(backIdObject.serialization());

      if (verification.verifyFrontIdAndBackId(frontIdObject, backIdObject)) {
        throw new Error("Pictures of flow quality");
      }
    } catch (error) {
      console.error("Error processing files: ", error as string);
    }
    const base64test: string =
      "ewogICJzdXJuYW1lIjoiIE5BWldJU0tPIiwKICAiZ2l2ZW5OYW1lcyI6IiBJTUlFIiwKICAiZmFtaWx5TmFtZSI6IiBOQVpXSVNLTyIsCiAgInBhcmVudHNOYW1lIjoiVEVTVCBURVNUIiwKICAiZGF0ZU9mQmlydGgiOjg5NTUyODgwMCwKICAiZGF0ZU9mSXNzdWUiOjE0NjM5NTQ0MDAsCiAgImV4cGlyeURhdGUiOjE3Nzk0ODcyMDAsCiAgInBlcnNvbmFsTnVtYmVyIjoiMTExMTExMTExMTEiLAogICJpZGVudGl0eUNhcmROdW1iZXIiOiJDQ0M0NDQ0NDQiCn0=";

    init().then(() => {
      const res = age_proof_generation(base64test);
      console.log(res);
    });
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
