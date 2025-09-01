export type PosterTheme = {
  id: string;
  font: "compact" | "rounded";          // maps to font vars
  textAlign: "center" | "left" | "right";
  textPosition: "center" | "lower" | "upper";
  overlay: "vignette" | "duotone" | "gradient";
  tint?: string;                         // for duotone/tint overlays
  footer: "glass" | "solid";
  gapScale?: number;                     // spacing multiplier between lines
  textShadow: boolean;
};

export const THEMES: PosterTheme[] = [
  { id:"cinema-center", font:"compact", textAlign:"center", textPosition:"center", overlay:"vignette", footer:"glass", gapScale:1.0, textShadow:true },
  { id:"glass-lower",   font:"rounded", textAlign:"center", textPosition:"lower",  overlay:"gradient", footer:"glass", gapScale:1.2, textShadow:true },
  { id:"duotone-left",  font:"compact", textAlign:"left",   textPosition:"center", overlay:"duotone", tint:"#4CC9F0", footer:"solid", gapScale:0.9, textShadow:false },
  { id:"blueprint-top", font:"rounded", textAlign:"left",   textPosition:"upper",  overlay:"gradient", footer:"glass", gapScale:1.1, textShadow:true },
  { id:"silhouette-low",font:"compact", textAlign:"right",  textPosition:"lower",  overlay:"vignette", footer:"solid", gapScale:1.15, textShadow:true },
];

export function pickTheme(seed?:string) {
  // simple deterministic pick if seed provided
  const idx = seed ? Math.abs(seed.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % THEMES.length : Math.floor(Math.random()*THEMES.length);
  return THEMES[idx];
}
