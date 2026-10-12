export type Conversation = {
  title: string;
  author: string;
  date: string;
  platform: string;
  source: string;
  url: string;
  quote: string;
  relatedBookId?: string;
  excerpt?: string;
};

export const conversationsIntro =
  "Some of what we've read together has spilled out into the wider world — into LinkedIn posts, comment threads, and conversations that pull others into the orbit.";

export const conversations: Conversation[] = [
  {
    title:
      "Quality Comes First — a review of Deming's Road to Continual Improvement by William W. Scherkenbach",
    author: 'Mike Harris',
    date: '2025.09.16',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2025/09/16/quality-comes-first-a-review-of-demings-road-to-continual-improvement-by-william-w-scherkenbach/',
    quote:
      'We can learn a great deal from William Scherkenbach about how to operationalize the Deming philosophy — in business, government, and academia.',
    relatedBookId: 'demings-road',
  },
];
