export type UpcomingBook = {
  number: string;
  title: string;
  author: string;
  startDate: string;
  season?: string;
  blurb?: string;
  connection?: 'direct' | 'adjacent';
};

export const upcomingBook: UpcomingBook | null = null;
