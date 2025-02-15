'use client';

import { Button } from './ui/button';
import ClipLoader from 'react-spinners/ClipLoader';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? (
        <>
          Please Wait
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
