import ShareMenu from "./ShareMenu";

export default function TestimonialCard({ name, date, message }: { name: string; date: string; message: string }) {
  return (
    <article className="rounded-lg bg-[#111827] text-[#F9FAFB] ring-1 ring-[#D4AF37] shadow-md p-4 focus-within:ring-2">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-xs opacity-80" aria-label="posted on">{date}</p>
        </div>
        <ShareMenu />
      </header>
      <p className="mt-3 whitespace-pre-wrap leading-relaxed">{message}</p>
    </article>
  );
}


