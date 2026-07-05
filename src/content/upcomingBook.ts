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
  number: 'XVII',
  title: 'Leadership Is Language',
  author: 'L. David Marquet',
  startDate: 'Aug 14, 2026',
  season: 'late summer 2026',
  blurb:
    "Marquet's follow-up to Turn the Ship Around: This is a study of how the words leaders choose either shut down thinking or invite it. A natural companion to the questions about culture, variation, and the psychology of people that run through Profound Knowledge.\n\nIn Leadership Is Language, Marquet explicitly draws on Dr. W. Edwards Deming's critique of command-and-control management and his call for leaders to redesign systems rather than blame people. Dr. Deming argued that most performance problems arise from the system, and that effective leadership means creating conditions where people can think, learn, and improve together. Marquet extends that philosophy into everyday conversations: he shows how leaders' words can either reinforce fear and compliance or invite curiosity, shared ownership, and continuous improvement. These are the very capabilities Dr. Deming saw as essential to quality and transformation.",
  connection: 'adjacent',
};
