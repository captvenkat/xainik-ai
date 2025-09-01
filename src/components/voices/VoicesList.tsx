import TestimonialCard from "./TestimonialCard";
import Link from "next/link";

type T = {
  id: string;
  name: string;
  message: string;
  createdAt: string | Date;
};

export default function VoicesList({ testimonials }: { testimonials: T[] }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {testimonials.map((t) => (
        <Link key={t.id} href={`/voices/${t.id}`} className="block hover:scale-[1.02] transition-transform">
          <TestimonialCard name={t.name} date={new Date(t.createdAt).toLocaleDateString()} message={t.message} />
        </Link>
      ))}
    </section>
  );
}


