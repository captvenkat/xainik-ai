export const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const safeSeedInputs = [
  "deadlines", "traffic", "Mondays", "emails", "excel sheets",
  "public speaking", "sales targets", "long meetings"
];

export const cachedBackgrounds = [
  "runway-01.webp", "runway-02.webp", "convoy-01.webp", "bridge-01.webp",
  "map-01.webp", "mountain-01.webp", "silhouette-01.webp", "controlroom-01.webp"
];

export function splitPoster(poster: string) {
  const lines = poster.split('\n').filter(Boolean);
  const [l1 = '', l2 = '', l3 = ''] = lines;
  return { l1, l2, l3 };
}
