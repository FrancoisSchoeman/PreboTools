import ClipLoader from 'react-spinners/ClipLoader';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <ClipLoader color="#000" loading={true} size={150} />
    </div>
  );
}
