import ResumeVibeCheck from '@/components/ResumeVibeCheck'

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="w-full flex flex-col items-center gap-4">
        <div className="bg-gradient-spike text-transparent bg-clip-text">
          <h1 className="headline font-bold text-center">Resume Vibes Check</h1>
        </div>
        <p className="body-text text-center max-w-xl text-secondary">
          Let AI analyze your resume and give you a fun, quirky (but slightly insightful) feedback using modern internet language.
        </p>
      </header>
      
      {/* Main Content */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-10">
        <ResumeVibeCheck />
      </main>
      
      {/* Footer */}
      <footer className="w-full text-center">
        <p className="tag text-secondary">Built with modern vibes ✨</p>
      </footer>
    </div>
  );
}
