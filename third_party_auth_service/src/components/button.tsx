'use client';
import clsx from 'clsx';
import { ComponentProps, FC } from 'react';

interface ButtonProps {
  variants?: 'primary' | 'secondary' | 'danger';
}

export const Button: FC<ComponentProps<'button'> & ButtonProps> = ({ children, variants = 'primary', className, ...props }) => {
  return (
    <button
      className={clsx(
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants === 'primary' && 'bg-indigo-600 text-white px-4 py-2 rounded-md border-l border-t border-r border-white/10 bg-gradient-to-t from-indigo-500 to-indigo-600',
        variants === 'danger' && 'bg-rose-600 text-white px-4 py-2 rounded-md border-l border-t border-r border-white/10 bg-gradient-to-t from-rose-500 to-rose-600',
        variants === 'secondary' && 'bg-slate-500/10 text-white px-4 py-2 rounded-md border border-slate-500/25',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
