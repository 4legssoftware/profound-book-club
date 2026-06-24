export type PsaKind = 'event' | 'video' | 'resource';

export type Psa = {
  title: string;
  url: string;
  kind: PsaKind;
  blurb: string;
  meta?: string;
};

export const psaIntro =
  "Events, talks, and resources that orbit the same questions we wrestle with in the club — promoted here because they're worth your time.";

export const psas: Psa[] = [
  {
    title: 'In2:InThinking Network Forum 2026',
    url: 'https://www.in2in.org/events',
    kind: 'event',
    meta: '18th Annual Forum',
    blurb:
      'This year\'s theme: "Curiosity / What If…?" — a gathering of practitioners working in the tradition of systems thinking and Profound Knowledge.',
  },
  {
    title: "Deming's 14 Points — video series",
    url: 'https://www.youtube.com/@DemingInstitute',
    kind: 'video',
    meta: 'The Deming Institute',
    blurb:
      "A walk through the Fourteen Points, one at a time, from the institute that stewards Deming's work.",
  },
];

export function formatPsaLabel(psa: Psa): string {
  const kindLabel =
    psa.kind === 'event' ? 'Event' : psa.kind === 'video' ? 'Video Series' : 'Resource';
  return psa.meta ? `${kindLabel} · ${psa.meta}` : kindLabel;
}
