import ResumeVibeCheck from '@/components/ResumeVibeCheck'

export default function Home() {
  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center gap-12">
      {/* Header */}
      <header className="w-full flex flex-col items-center gap-6 mt-8 mb-10">
        <div className="bg-gradient-spike text-transparent bg-clip-text">
          <h1 className="headline font-bold text-center">Resume Vibes Check</h1>
        </div>
        <p className="body-text text-center max-w-xl text-secondary px-4">
          Let AI analyze your resume and give you a fun, quirky (but slightly insightful) feedback using modern internet language.
        </p>
      </header>
      
      {/* Main Content */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-10 py-4">
        <ResumeVibeCheck />
      </main>
      
      {/* Footer */}
      <footer className="w-full text-center mt-auto pt-10">
        <p className="tag text-secondary">Built with modern vibes ✨</p>
      </footer>
    </div>
  );
}
