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
  number: 'XVIII',
  title: "The Leader's Handbook",
  author: 'Peter Scholtes',
  startDate: 'Oct 16',
  season: 'fall 2026',
  connection: 'direct',
  blurb:
    "Our next Profound Book Club selection is The Leader's Handbook by Peter Scholtes, a practical and deeply " +
    'Deming-informed guide to leadership as the work of improving systems—not managing or motivating individuals ' +
    'in isolation.\n\nScholtes explores how leaders can create the conditions for people to do good work: ' +
    'understanding variation, removing barriers, fostering cooperation, and replacing blame with learning. ' +
    'He also makes the case for abandoning performance appraisals and rankings that pit people against one ' +
    'another rather than improving the system in which they work.\n\nIt should be a valuable foundation for ' +
    'discussing what it means to lead with knowledge, respect for people, and continual improvement.',
};
