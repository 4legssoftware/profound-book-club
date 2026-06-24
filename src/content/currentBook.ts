export type ScheduleItem = {
  week: string;
  date: string;
  chapters: string;
  break?: boolean;
};

export const currentBook = {
  number: 'XVI',
  title: 'Sidewinder',
  author: 'Dr. Ron Westrum',
  status: 'Currently reading',
  season: 'summer 2026',
  abstract:
    "Ron Westrum's history of the Sidewinder air-to-air missile — and, more deeply, of the unusual organizational culture at China Lake that made its development possible. A study in how a small team, given the right conditions, produced a revolutionary weapon while peers with vastly greater resources could not. Westrum, an organizational sociologist, examines the question that runs through all of his work: what kind of culture allows people to do extraordinary things?",
  positioning:
    "Westrum's typology of organizational cultures — pathological, bureaucratic, generative — sits squarely within the psychology of people that Deming placed at the heart of Profound Knowledge. The Sidewinder story is a case study in what becomes possible when a system is designed to flow information freely, treat failure as learning, and trust the people closest to the work.",
  schedule: [
    { week: 'Week 1', date: 'Jun 12', chapters: 'Chapters 1–4' },
    { week: 'Week 2', date: 'Jun 19', chapters: 'Chapters 5–7' },
    { week: 'Week 3', date: 'Jun 26', chapters: 'Chapters 8–11' },
    { week: '—', date: 'Jul 3', chapters: 'No meeting · U.S. holiday weekend', break: true },
    { week: 'Week 4', date: 'Jul 10', chapters: 'Chapters 12–14' },
    { week: 'Week 5', date: 'Jul 17', chapters: 'Chapters 15–17' },
    { week: 'Week 6', date: 'Jul 24', chapters: 'Chapters 18–19' },
  ] satisfies ScheduleItem[],
};
