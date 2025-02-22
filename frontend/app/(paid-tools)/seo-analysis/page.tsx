import { KeywordAnalyserForm } from './_components/KeywordAnalyserForm';

export default function KeywordAnalyserPage() {
  return (
    <div className="mb-8 md:my-8 flex items-center justify-center">
      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">SEO Analysis Tool</h1>
        <KeywordAnalyserForm />
      </div>
    </div>
  );
}
