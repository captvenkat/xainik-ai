import { supabaseService } from '@/lib/supabase-server';
import PosterCard from '@/components/PosterCard';
import { notFound } from 'next/navigation';

export default async function PosterPage({ params }: { params: { id: string } }) {
  try {
    const sb = supabaseService();
    const { data: meme, error } = await sb
      .from('memes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !meme) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-[#0A1F44] text-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">IMPOSSIBLE IS ROUTINE.</h1>
            <p className="opacity-80">Shared by {meme.name_label}</p>
          </div>

          <div className="max-w-[520px] mx-auto">
            <PosterCard
              bgUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/backgrounds/${meme.bg_key}`}
              l1={meme.output_l1}
              l2={meme.output_l2}
              tagline={meme.tagline}
            />
          </div>

          <div className="mt-8 text-center space-y-4">
            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-sm opacity-70 mb-2">Original input:</p>
              <p className="font-medium">"{meme.input_text}"</p>
            </div>

            <div className="flex justify-center gap-4 text-sm opacity-70">
              <span>❤️ {meme.likes_count || 0}</span>
              <span>📤 {meme.shares || 0}</span>
              <span>📅 {new Date(meme.created_at).toLocaleDateString()}</span>
            </div>

            <div className="pt-4">
              <a
                href="/"
                className="inline-block rounded-xl px-6 py-3 bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
              >
                Create Your Own
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Poster page error:', error);
    notFound();
  }
}
