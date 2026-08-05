export type ScheduleItem = {
  week: string;
  date: string;
  chapters: string;
  break?: boolean;
};

export const currentBook = {
  number: 'XVII',
  title: 'Leadership Is Language',
  author: 'L. David Marquet',
  status: 'Currently reading',
  season: 'summer 2026',
  abstract:
    "Marquet's follow-up to Turn the Ship Around: This is a study of how the words leaders choose either shut down thinking or invite it. A natural companion to the questions about culture, variation, and the psychology of people that run through Profound Knowledge.",
  positioning:
    "In Leadership Is Language, Marquet explicitly draws on Dr. W. Edwards Deming's critique of command-and-control management and his call for leaders to redesign systems rather than blame people. Dr. Deming argued that most performance problems arise from the system, and that effective leadership means creating conditions where people can think, learn, and improve together. Marquet extends that philosophy into everyday conversations: he shows how leaders' words can either reinforce fear and compliance or invite curiosity, shared ownership, and continuous improvement. These are the very capabilities Dr. Deming saw as essential to quality and transformation.",
  schedule: [
    { week: 'Week 1', date: 'Aug 14', chapters: 'Chapters 1–2' },
    { week: 'Week 2', date: 'Aug 21', chapters: 'Chapters 3–4' },
    { week: 'Week 3', date: 'Aug 28', chapters: 'Chapters 5–6' },
    { week: '—', date: 'Sep 4', chapters: 'No meeting · U.S. holiday weekend', break: true },
    { week: 'Week 4', date: 'Sep 11', chapters: 'Chapters 7–8' },
    { week: 'Week 5', date: 'Sep 18', chapters: 'Chapters 9–10' },
    { week: 'Week 6', date: 'Sep 25', chapters: 'Chapter 11' },
  ] satisfies ScheduleItem[],
};
