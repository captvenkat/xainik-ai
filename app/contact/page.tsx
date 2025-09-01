'use client';
import { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [message, setMessage] = useState('');
  const [ok, setOk] = useState<boolean | null>(null);

  async function submit() {
    if (!email.trim() || !message.trim()) {
      alert('Please provide email and message');
      return;
    }

    try {
      // Try Supabase insert first
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (response.ok) {
        setOk(true);
        // Clear form
        setName('');
        setEmail('');
        setMessage('');
        alert('Message sent successfully! We\'ll get back to you soon.');
      } else {
        throw new Error('Supabase insert failed');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      // Fallback to mailto
      try {
        window.location.href = `mailto:contact@xainik.com?subject=Contact%20from%20${encodeURIComponent(name || 'Anonymous')}&body=${encodeURIComponent(message + '\n\n' + email)}`;
        setOk(true);
        alert('Opening your mail client as fallback...');
      } catch (mailtoError) {
        setOk(false);
        alert('Failed to send message. Please try again or email us directly.');
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#0A1F44] text-white p-6">
      <h1 className="text-2xl font-extrabold mb-1">Contact Us</h1>
      <p className="opacity-80 mb-4">For partnerships, media, or support.</p>
      <div className="max-w-md space-y-3">
        <input className="w-full rounded-lg px-4 py-3 text-black" placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full rounded-lg px-4 py-3 text-black" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <textarea className="w-full rounded-lg px-4 py-3 text-black h-32" placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
        <button onClick={submit} className="rounded-xl px-4 py-3 bg-white text-black font-semibold">Send Message</button>
        <p className="text-sm opacity-70">Or email us directly at <a className="underline" href="mailto:contact@xainik.com">contact@xainik.com</a>.</p>
        {ok === true && <p className="text-emerald-300 text-sm">Thanks! Opening your mail client…</p>}
      </div>
    </main>
  );
}
