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
    title: 'Deming Strategies for Sustainable Success: Innovate, Streamline, Lead',
    url: 'https://deming.org/events/deming-strategies-for-sustainable-success-innovate-streamline-lead/',
    kind: 'event',
    meta: '2-Day Seminar',
    blurb:
      "Nov 6–7, 2026 at Fordham's Lincoln Center — two days with Deming experts, working a real challenge through the system behind it.",
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
