'use client';
import { useEffect, useMemo, useState } from 'react';
import PosterCard from './PosterCard';

const EXAMPLES = [
  { input:"Deadlines", l1:"Finishing deadlines feels impossible.", l2:"Soldiers synchronize moving parts under pressure." },
  { input:"Public speaking", l1:"Public speaking feels impossible.", l2:"Soldiers brief hundreds before critical ops." },
  { input:"Excel sheets", l1:"Excel sheets feel impossible.", l2:"Soldiers coordinate logistics with precision." },
  { input:"Focus", l1:"Staying focused feels impossible.", l2:"Soldiers maintain attention in chaos." },
];

export default function HeroDemo(){
  const [idx,setIdx]=useState(0);
  useEffect(()=>{
    const t = setInterval(()=> setIdx(i=>(i+1)%EXAMPLES.length), 2800);
    return ()=>clearInterval(t);
  },[]);
  const ex = EXAMPLES[idx];
  const bg = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/backgrounds/runway-0${(idx%4)+1}.webp`;
  return (
    <div className="max-w-[520px] mx-auto mt-6">
      <PosterCard bgUrl={bg} l1={ex.l1} l2={ex.l2} tagline="IMPOSSIBLE IS ROUTINE." seed={ex.input}/>
    </div>
  );
}
