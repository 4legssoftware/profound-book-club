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
    'managing people in isolation. It helps leaders understand systems, variation, learning, and human behavior, and ' +
    'examine the management practices that either create pride in work or get in its way. Among its clearest ' +
    'applications is its critique of performance appraisals and forced rankings: why they undermine trust and ' +
    'cooperation, and how leaders can replace them with better feedback, development, and improvement practices.',
  positioning:
    'Scholtes was a close colleague of Dr. W. Edwards Deming and shared the seminar platform with him from 1987 to 1993, ' +
    "helping organizations learn Deming's management philosophy. The Leader's Handbook makes Deming's System of " +
    'Profound Knowledge concrete: understanding systems and variation; building knowledge through prediction, data, ' +
    'and learning rather than guesswork; and applying psychology by leading with respect rather than fear, blame, or ' +
    'ranking. Where Deming identified the annual performance appraisal as one of the diseases of management, Scholtes ' +
    'explains in plain language why appraisal-based management fails—and how leaders can redesign the conditions of ' +
    'work so that cooperation, learning, and improvement become possible.',
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
