import TestimonialCard from "./TestimonialCard";

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
        <TestimonialCard key={t.id} name={t.name} date={new Date(t.createdAt).toLocaleDateString()} message={t.message} />)
      )}
    </section>
  );
}


