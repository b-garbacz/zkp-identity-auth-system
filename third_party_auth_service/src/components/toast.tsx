'use client';

import { ClientPortal } from '@/components/client-portal';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { FC, useEffect } from 'react';

type Variants = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: Variants;
  onClose?: () => void;
}

export const Toast: FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <ClientPortal id="toast">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx('px-4 py-3 rounded-br-lg rounded-bl-lg rounded-tl-sm rounded-tr-sm w-full flex gap-2 shadow-md bg-white justify-start relative overflow-hidden')}
      >
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: 'easeInOut' }}
          className={clsx(
            type === 'error' && 'bg-rose-500 absolute top-0 left-0 w-full h-1',
            type === 'warning' && 'bg-yellow-500 absolute top-0 left-0 w-full h-1',
            type === 'info' && 'bg-indigo-500 absolute top-0 left-0 w-full h-1',
            type === 'success' && 'bg-green-500 absolute top-0 left-0 w-full h-1',
            'origin-left',
          )}
        />
        <span className={clsx('w-5 text-center', type === 'info' && 'text-indigo-700')}>
          {type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'info' ? 'ℹ️' : type === 'success' ? '✅' : null}
        </span>
        <span className="text-black">{message}</span>
      </motion.div>
    </ClientPortal>
  );
};
