'use client';
import { Button } from '@/components/button';
import { Layout } from '@/components/layout';
import { Toast } from '@/components/toast';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const Dashboard = () => {
  const params = useSearchParams();
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const { push } = useRouter();


  const email = params.get('email');

  const [isDeletedOpen, [openDeleted, closeDeleted]] = useToast();

  const deleteProof = async () =>
    fetch(`/api/proof`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      })
    }).then(() => {
      openDeleted();
      push('/');
    });

  useEffect(() => {
    (async () => {
      const data = await fetch(`/api/proof?email=${email}&type=expiry`);
      const res = await data.json();

      const {expirationDate} = JSON.parse(res.body)

      const date = new Date(expirationDate);
      const comparedDate = new Date();
      const isExpired = date.getTime() < comparedDate.getTime();

      if (isExpired) {
        deleteProof();
        return push('/');
      }

      setExpirationDate(expirationDate ?? null);
    })();
  }, []);

  const [isOpen, [open, close]] = useToast();

  const getToken = async () => {
    fetch(`/api/attestation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      })
    }).then(() =>
      fetch(`/api/attestation?email=${email}`)
        .then((data) => data.json())
        .then((res) => {
          open();
          navigator.clipboard.writeText(res.token);
        }),
    );
  };

  return (
    <Layout className="text-white">
      {isOpen && <Toast type="info" message="The attestation was copied to clipboard" onClose={close} />}
      {isDeletedOpen && <Toast type="success" message="The evidence was deleted" onClose={closeDeleted} />}
      <div className="max-w-sm w-full flex flex-col gap-5 items-center">
        <div className="p-5 flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 max-w-sm w-full">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p>Your evidence will expire in {expirationDate}.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => getToken()}>Get token</Button>
          <Button variants="danger" onClick={() => deleteProof()}>
            Delete
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
