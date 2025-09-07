export default function Privacy() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-black mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="mb-4">
            This privacy policy explains how Xainik collects and uses your information.
          </p>
          <h2 className="text-xl font-bold mt-8 mb-4">Information We Collect</h2>
          <p className="mb-4">
            We collect device identifiers to track engagement with our content. 
            We do not collect personal information unless you provide it voluntarily.
          </p>
          <h2 className="text-xl font-bold mt-8 mb-4">How We Use Information</h2>
          <p className="mb-4">
            We use collected information to improve our platform and understand 
            how users interact with our content.
          </p>
          <h2 className="text-xl font-bold mt-8 mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your information.
          </p>
          <h2 className="text-xl font-bold mt-8 mb-4">Contact</h2>
          <p>
            For questions about this privacy policy, please contact us.
          </p>
        </div>
      </div>
    </main>
  );
}
