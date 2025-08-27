export interface Target {
  type: 'industry'|'role'|'company'|'geography'|'seniority'|'function'|'team'|'domain'|'tech'|'certification';
  value: string;
}

export type StyleSeed = { format: 'prose'|'bullets'|'numbered'; tone: 'direct'|'reflective' };

export function formatTargets(targets: Target[] = []): string {
  if (!targets.length) return 'Targets: none.';
  const parts = targets.map((t,i)=> `${i===0?'Primary':'Secondary'} target: ${t.type}=${t.value}`);
  return parts.join('; ') + '.';
}

export function pickStyleSeed(seed?: Partial<StyleSeed>): StyleSeed {
  const formats: StyleSeed['format'][] = ['prose','bullets','numbered'];
  const tones: StyleSeed['tone'][] = ['direct','reflective'];
  
  const format = seed?.format || formats[Math.floor(Math.random()*formats.length)] as StyleSeed['format'];
  const tone = seed?.tone || tones[Math.floor(Math.random()*tones.length)] as StyleSeed['tone'];
  
  return { format, tone };
}

export function buildSystemBase(targetsSentence: string) {
  return [
    'Write in first person singular ("I …").',
    'Plain language. No em dashes. No fluff. No generic praise. No bragging.',
    'Use only facts in the resume. If insufficient, return minimal JSON with an "explain" key.',
    'Prefer numbers over adjectives when available. Use {METRIC_HERE}/{BASELINE_HERE} placeholders if missing.',
    `Context: ${targetsSentence}`,
  ].join(' ');
}
