"use client";
import { useState } from "react";

const preset = encodeURIComponent(
  "I shared why supporting India’s retired soldiers matters — and how Xainik is fixing post-retirement careers. Add your voice and help: {URL}\n#DontJustThankASoldier #HelpHireOne #Xainik"
);

export default function ShareMenu() {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "https://xainik.com";
  const msg = decodeURIComponent(preset).replace("{URL}", url);
  const enc = encodeURIComponent(msg);

  return (
    <div className="flex items-center gap-2">
      <a aria-label="Share on WhatsApp" className="underline" href={`https://wa.me/?text=${enc}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a aria-label="Share on X" className="underline" href={`https://twitter.com/intent/tweet?text=${enc}`} target="_blank" rel="noopener noreferrer">X</a>
      <a aria-label="Share on LinkedIn" className="underline" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a aria-label="Share on Facebook" className="underline" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
      <button
        aria-label="Copy link"
        className="underline"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >{copied ? "Copied" : "Copy Link"}</button>
    </div>
  );
}


