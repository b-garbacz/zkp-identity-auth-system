'use client';

import { ComponentProps, FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Variants = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: Variants;
}

export const ClientPortal: FC<ComponentProps<'div'>> = ({ children, id }) => {
  const [isClient, setIsClient] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    ref.current = document.getElementById(id ?? '');
  }, []);

  return isClient && createPortal(children, ref.current!);
};
