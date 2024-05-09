"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { processImages, recognizeTextFromImage } from "@/client/dataProcessing";
import { convertToBase64, base64ToImageElement } from "@/client/base64";
import * as verification from "@/client/idVerification";
import { FrontID } from "@/client/frontID";
import { BackID } from "@/client/backID";
import init, { age_proof_generation } from "@/static/wasm/age_generation_proof";
import { mergeIdInformation, PersonalData } from "@/client/personalData";

export default function Home() {
  const { data } = useSession();
  const [showUploadFields, setShowUploadFields] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleCreateEvidence = () => {
    setShowUploadFields(true);
  };

  async function fetchProof(proof: string, expiryDate: Number | null) {
    try {
      const email = data?.user?.email;
      const response = await fetch("/api/proof", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          expiryDate: expiryDate,
          proofOfUser: proof,
        }),
      });
      setProcessing(false);
    } catch (error) {
      console.error("Error sending proof: ", error as string);
      setProcessing(false);
    }
  }

  const OnProcess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowUploadFields(false);
    setFilesUploaded(false);
    setProcessing(true);

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

      if (verification.verifyFrontIdAndBackId(frontIdObject, backIdObject)) {
        throw new Error("Pictures of flow quality");
      }

      const personelData: PersonalData = mergeIdInformation(
        frontIdObject,
        backIdObject
      );

      const bufferSerializedPersonalData = Buffer.from(
        JSON.stringify(personelData)
      );

      let encodedData = bufferSerializedPersonalData.toString("base64");
      let proof: string;

      init().then(() => {
        proof = age_proof_generation(encodedData);
        fetchProof(proof, personelData.expiryDate);
      });
    } catch (error) {
      console.error("Error processing files: ", error as string);
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
            {processing ? (
              // Warunkowe wyświetlanie kółka obok przycisku, jeśli proces jest w trakcie
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-200"></div>
                <span className="ml-2">Processing...</span>
              </div>
            ) : (
              // Jeśli proces nie jest w trakcie, wyświetl "Process Evidence"
              "Process Evidence"
            )}
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
