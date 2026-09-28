export type ScheduleItem = {
  week: string;
  date: string;
  chapters: string;
  break?: boolean;
};

export const currentBook = {
  number: 'XVIII',
  title: "The Leader's Handbook",
  author: 'Peter Scholtes',
  status: 'Currently reading',
  season: 'fall 2026',
  abstract:
    "Peter Scholtes' The Leader's Handbook is a practical guide to leadership as the work of improving systems—not " +
    'managing people in isolation. It walks leaders through systems thinking, variation, learning, and the habits that ' +
    'either create pride in work or get in its way. Among its clearest applications: why performance appraisals and ' +
    'rankings undermine cooperation, and what to do instead.',
  positioning:
    'Scholtes was a friend and colleague of Dr. W. Edwards Deming and shared the seminar platform with him for years, ' +
    "helping organizations learn the new philosophy of quality. The Leader's Handbook speaks directly to Deming's " +
    'System of Profound Knowledge: understanding systems and variation, building knowledge through learning rather than ' +
    'guesswork, and leading people with respect instead of fear, blame, and ranking. Where Deming named annual appraisal ' +
    'among the diseases of management, Scholtes shows in plain language why those practices fail—and how leaders can ' +
    'redesign the conditions of work so improvement becomes possible.',
  schedule: [
    { week: 'Week 1', date: 'Oct 16', chapters: 'Chapters 1–2' },
    { week: 'Week 2', date: 'Oct 23', chapters: 'Chapter 3' },
    { week: 'Week 3', date: 'Oct 30', chapters: 'Chapter 4' },
    { week: 'Week 4', date: 'Nov 6', chapters: 'Chapters 5–6' },
    { week: 'Week 5', date: 'Nov 13', chapters: 'Chapters 7–8' },
    { week: 'Week 6', date: 'Nov 20', chapters: 'Chapter 9' },
    { week: '—', date: 'Nov 27', chapters: 'No meeting · U.S. holiday weekend', break: true },
    { week: 'Week 7', date: 'Dec 4', chapters: 'Chapter 10' },
  ] satisfies ScheduleItem[],
};
