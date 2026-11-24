export type PsaKind = 'event' | 'video' | 'podcast' | 'resource';

export type Psa = {
  title: string;
  url: string;
  kind: PsaKind;
  blurb: string;
  meta?: string;
};

export const psaIntro =
  "Events, talks, and resources that orbit the same questions we wrestle with in the club — promoted here because they're worth your time.";

const kindLabels: Record<PsaKind, string> = {
  event: 'Event',
  video: 'Video Series',
  podcast: 'Podcast',
  resource: 'Resource',
};

export const psas: Psa[] = [
  {
    title: 'Tools & Methods Catalog in DemingNEXT',
    url: 'https://www.youtube.com/playlist?list=PLdxAnF1F8MHA',
    kind: 'video',
    meta: 'The Deming Institute',
    blurb:
      'Short videos from the institute on PDSA, control charts, and the other methods in the DemingNEXT catalog.',
  },
  {
    title: '14 Points for Management',
    url: 'https://www.youtube.com/playlist?list=PLIpkt_z8kJT8CIlnRfLk8r40LaTRJH9O5',
    kind: 'video',
    meta: 'The Deming Institute',
    blurb:
      "A walk through the Fourteen Points, one at a time, from the institute that stewards Deming's work.",
  },
  {
    title: 'In Their Own Words',
    url: 'https://podcast.deming.org/',
    kind: 'podcast',
    meta: 'The Deming Institute',
    blurb: 'Conversations about applying Deming in modern organizations.',
  },
];

export function formatPsaLabel(psa: Psa): string {
  const kindLabel = kindLabels[psa.kind];
  return psa.meta ? `${kindLabel} · ${psa.meta}` : kindLabel;
}
