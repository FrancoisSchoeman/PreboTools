'use client';

import { Button } from './ui/button';
import ClipLoader from 'react-spinners/ClipLoader';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({
  children,
  className,
  submitText,
}: {
  children: React.ReactNode;
  className?: string;
  submitText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" className={className}>
      {pending ? (
        <>
          {submitText ? submitText : 'Please Wait'}
          <ClipLoader
            color="#f35c33"
            loading={true}
            size={18}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </>
      ) : (
        children
      )}
    </Button>
  );
}
