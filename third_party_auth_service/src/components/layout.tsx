import clsx from 'clsx';
import { ComponentProps, FC } from 'react';

export const Layout: FC<ComponentProps<'div'>> = ({ children, className, ...props }) => {
  return (
    <div className={clsx('relative min-h-screen flex items-center justify-center', className)} {...props}>
      {children}
    </div>
  );
};
