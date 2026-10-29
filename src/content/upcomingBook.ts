export type UpcomingBook = {
  number: string;
  title: string;
  author: string;
  startDate: string;
  season?: string;
  blurb?: string;
  connection?: 'direct' | 'adjacent';
};

export const upcomingBook: UpcomingBook | null = {
  number: 'XIX',
  title: 'Signals & Levers: Systems Thinking Tools to Unblock Software Delivery',
  author: 'Elisabeth Hendrickson and Joel Tosi',
  startDate: 'Jan 8, 2027',
  season: 'winter 2027',
  blurb:
    'It is an especially fitting read for the Profound Book Club: a practical exploration of how to ' +
    'distinguish signal from noise, understand variation, see the system behind recurring problems, and choose ' +
    'interventions that lead to lasting improvement rather than change theater.\n\n' +
    'The book weaves its teachings through a fictional software-delivery storyline, giving the ideas a concrete, ' +
    'recognizable context reminiscent of The Phoenix Project. Alongside the narrative, Hendrickson and Tosi draw on ' +
    'statistical process control, systems thinking, and economic theory to help us frame problems as testable ' +
    'hypotheses, reveal causal relationships, and avoid "solutions" that merely shift problems elsewhere.',
};
