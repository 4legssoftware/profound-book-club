export type Connection = 'direct' | 'adjacent';

export type PastBook = {
  date: string;
  title: string;
  author?: string;
  connection: Connection;
  kind?: string;
  current?: boolean;
};

export const chronologyIntro =
  "Each selection connects, in some way, to Dr. Deming's System of Profound Knowledge — whether written by Deming himself, by those who worked alongside him, or by thinkers whose work illuminates the same fundamental ideas about systems, variation, knowledge, and people.";

export const chronology: PastBook[] = [
  {
    date: '2023.08',
    title: "Deming's Journey to Profound Knowledge",
    author: 'John Willis',
    connection: 'direct',
    kind: 'Biography',
  },
  {
    date: '2023.10',
    title: 'The World of W. Edwards Deming',
    author: 'Cecilia S. Kilian',
    connection: 'direct',
    kind: 'Memoir',
  },
  {
    date: '2024.01',
    title: 'Wiring the Winning Organization',
    author: 'Gene Kim & Steven Spear',
    connection: 'adjacent',
    kind: 'Systems',
  },
  { date: '2024.04', title: 'Win-Win', author: 'John Dues', connection: 'adjacent' },
  {
    date: '2024.06',
    title: 'Learning to Lead, Leading to Learn',
    author: 'Katie Anderson',
    connection: 'adjacent',
    kind: 'Leadership',
  },
  {
    date: '2024.09',
    title: 'Deming & Goldratt',
    author: 'Domenico Lepore & Oded Cohen',
    connection: 'direct',
    kind: 'Systems',
  },
  {
    date: '2024.11',
    title: 'Idealized Design',
    author: 'Russell L. Ackoff, Jason Magidson & Herbert J. Addison',
    connection: 'adjacent',
    kind: 'Design',
  },
  {
    date: '2025.01',
    title: 'The New Economics',
    author: 'W. Edwards Deming',
    connection: 'direct',
    kind: 'Primary text',
  },
  {
    date: '2025.04',
    title: 'Rebels of Reason',
    author: 'John Willis & Derek Lewis',
    connection: 'adjacent',
  },
  {
    date: '2025.06',
    title: 'Sys-Tao',
    author: 'Woody Williams',
    connection: 'adjacent',
    kind: 'Philosophy',
  },
  {
    date: '2025.07',
    title: "Deming's Road to Continual Improvement",
    author: 'William W. Scherkenbach',
    connection: 'direct',
    kind: 'Practice',
  },
  {
    date: '2025.09',
    title: 'Thinking in Systems',
    author: 'Donella Meadows',
    connection: 'adjacent',
    kind: 'Systems',
  },
  {
    date: '2025.11',
    title: 'Twenty Things You Need to Know',
    author: 'Donald J. Wheeler',
    connection: 'adjacent',
  },
  {
    date: '2026.01',
    title: 'Out of the Crisis',
    author: 'W. Edwards Deming',
    connection: 'direct',
    kind: 'Primary text',
  },
  {
    date: '2026.02',
    title: 'The Phoenix Project',
    author: 'Gene Kim, Kevin Behr, George Spafford',
    connection: 'adjacent',
    kind: 'Novel',
  },
  {
    date: '2026.06',
    title: 'Sidewinder',
    author: 'Dr. Ron Westrum',
    connection: 'adjacent',
    current: true,
  },
];

export function formatChronMeta(book: PastBook): string {
  if (book.current) return 'Current selection';
  if (book.kind) {
    return `${book.kind} · ${book.connection === 'direct' ? 'Direct' : 'Adjacent'}`;
  }
  return book.connection === 'direct' ? 'Direct' : 'Adjacent';
}
