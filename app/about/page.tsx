export default function About() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-black mb-8">About Xainik</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-4">
            Xainik is a platform that celebrates military experience and leadership.
          </p>
          <p className="mb-4">
            We believe that experience matters more than certificates. Our platform showcases 
            the real stories, skills, and leadership that come from military service.
          </p>
          <p className="mb-4">
            Through our community, we connect veterans, share experiences, and highlight 
            the valuable skills that military service develops.
          </p>
          <p>
            Experience. Not certificates.
          </p>
        </div>
      </div>
    </main>
  );
}