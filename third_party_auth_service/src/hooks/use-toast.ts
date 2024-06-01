import { useState } from 'react';

type ToastFc = [open: () => void, close: () => void];

export const useToast = (): [isOpen: boolean, fc: ToastFc] => {
  const [isOpen, setOpen] = useState(false);

  const open = () => setOpen(true);
  const close = () => setOpen(false);

  return [isOpen, [open, close]];
};
