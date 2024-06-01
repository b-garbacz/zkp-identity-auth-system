'use client';

import { BackID } from '@/client/backID';
import { base64ToImageElement, convertToBase64 } from '@/client/base64';
import { processImages, recognizeTextFromImage } from '@/client/dataProcessing';
import { FrontID } from '@/client/frontID';
import * as verification from '@/client/idVerification';
import { PersonalData, mergeIdInformation } from '@/client/personalData';
import { Button } from '@/components/button';
import { Layout } from '@/components/layout';
import { Toast } from '@/components/toast';
import { useToast } from '@/hooks/use-toast';
import init, { age_proof_generation } from '@/static/wasm/age_generation_proof';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ProofDate = Number | null;

interface Proof {
  proofOfUser: string;
  expiryDate: ProofDate;
  dateOfBirth: ProofDate;
}

export default function Home() {
  const { data } = useSession();
  const [isOpen, [open, close]] = useToast();
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { push } = useRouter();

  async function fetchProof({ expiryDate, dateOfBirth, proofOfUser }: Proof) {
    try {
      const email = data?.user?.email;

      fetch('/api/proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          expiryDate,
          proofOfUser,
          dateOfBirth,
        }),
      });
    } catch (error) {
      console.error('Error sending proof: ', error as string);
      setProcessing(false);
    }
  }

  const OnProcess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);

    const formData = new FormData(e.currentTarget);
    const frontFile = formData.get('frontID') as File;
    const backFile = formData.get('backID') as File;

    try {
      const frontIdBase64 = await convertToBase64(frontFile);
      const backIdBase64 = await convertToBase64(backFile);
      const frontIdimage = await base64ToImageElement(frontIdBase64);
      const backIdimage = await base64ToImageElement(backIdBase64);

      const [canvasFront, canvasBack] = await processImages(frontIdimage, backIdimage);

      const frontIdText: string = await recognizeTextFromImage(canvasFront);
      const backIdText: string = await recognizeTextFromImage(canvasBack);

      const frontIdObject: FrontID = new FrontID(frontIdText);
      const backIdObject: BackID = new BackID(backIdText);

      if (verification.verifyFrontIdAndBackId(frontIdObject, backIdObject)) {
        throw new Error('Pictures of flow quality');
      }

      const personelData: PersonalData = mergeIdInformation(frontIdObject, backIdObject);

      const bufferSerializedPersonalData = Buffer.from(JSON.stringify(personelData));

      let encodedData = bufferSerializedPersonalData.toString('base64');
      let proof: string;

      init().then(() => {
        proof = age_proof_generation(encodedData);
        const { dateOfBirth, expiryDate } = personelData;

        fetchProof({
          proofOfUser: proof,
          expiryDate,
          dateOfBirth,
        }).then(() => {
          push(`/dashboard?email=${data?.user?.email}`);
        });

        open();
        setFilesUploaded(false);
      });
    } catch (error) {
      console.error('Error processing files: ', error as string);
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
      <main className="flex items-center justify-center min-h-screen gap-2">
        <Link
          href={'/auth/login'}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md border-l border-t border-r border-white/10 bg-gradient-to-t from-indigo-500 to-indigo-600"
        >
          <span className="drop-shadow-sm">Sign in</span>
        </Link>

        <Link href={'/auth/register'} className="bg-slate-500/10 text-white px-4 py-2 rounded-md border border-slate-500/25">
          <span className="drop-shadow-sm">Sign up</span>
        </Link>
      </main>
    );

  return (
    <Layout>
      {isOpen && <Toast message="Created evidence" type="success" onClose={close} />}
      <form onSubmit={OnProcess} className="p-6 bg-slate-900 border-t border-white/5 rounded-2xl shadow-lg max-w-md w-full flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-200">Create New Evidence</h2>
        </div>
        {!!data && (
          <div className="flex flex-col gap-2">
            <label htmlFor="frontID" className="text-white flex flex-col gap-1">
              <span className="text-sm font-medium">Identity card 1</span>
              <input
                type="file"
                id="frontID"
                className="block w-full text-sm border rounded-lg cursor-pointer text-slate-400 focus:outline-none bg-slate-950 border-slate-800 file:py-3 file:px-4 file:text-white placeholder-slate-400 file:bg-slate-800 file:mr-4 hover:file:bg-slate-700 hover:text-slate-300 file:border-none"
                name="frontID"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                required
              />
            </label>
            <label htmlFor="backID" className="text-white flex flex-col gap-1">
              <span className="text-sm font-medium">Identity card 2</span>
              <input
                type="file"
                id="backID"
                className="block w-full text-sm border rounded-lg cursor-pointer text-slate-400 focus:outline-none bg-slate-950 border-slate-800 file:py-3 file:px-4 file:text-white dark:placeholder-slate-400 file:bg-slate-800 file:mr-4 hover:file:bg-slate-700 hover:text-slate-300 file:border-none"
                name="backID"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                required
              />
            </label>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {filesUploaded && (
            <Button disabled={processing} type="submit">
              {processing ? (
                // Warunkowe wyświetlanie kółka obok przycisku, jeśli proces jest w trakcie
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-200"></div>
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                // Jeśli proces nie jest w trakcie, wyświetl "Process Evidence"
                'Process Evidence'
              )}
            </Button>
          )}
        </div>
      </form>
      <Button className=" absolute top-5 right-5" onClick={() => signOut()}>
        Logout
      </Button>
    </Layout>
  );
}
