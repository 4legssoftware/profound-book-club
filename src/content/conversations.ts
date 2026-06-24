export type Conversation = {
  author: string;
  platform: string;
  url: string;
  quote: string;
};

export const conversationsIntro =
  "Some of what we've read together has spilled out into the wider world — into LinkedIn posts, comment threads, and conversations that pull others into the orbit.";

export const conversations: Conversation[] = [
  {
    quote:
      'We can learn a great deal from William Scherkenbach about how to operationalize the Deming philosophy — in business, government, and academia.',
    author: 'Mike Harris',
    platform: 'Blog',
    url: 'https://testandanalysis.home.blog/2025/09/16/quality-comes-first-a-review-of-demings-road-to-continual-improvement-by-william-w-scherkenbach/',
  },
];
