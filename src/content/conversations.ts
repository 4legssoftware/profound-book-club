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
      'Help to move from test execution to decision-making – A Review of Leadership is Language by L. David Marquet',
    author: 'Mike Harris',
    date: '2026.10.06',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2026/10/06/help-to-move-from-test-execution-to-decision-making-a-review-of-leadership-is-language-by-l-david-marquet/',
    quote:
      "As testers, we know the way we communicate matters. We can learn from how David Marquet used language to improve his submarine's performance.",
    relatedBookId: 'leadership-is-language',
  },
  {
    title:
      'Creative teamwork for quality – A Review of “Sidewinder – Creative Missile Development at China Lake” by Ron Westrum',
    author: 'Mike Harris',
    date: '2026.09.15',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2026/09/15/creative-teamwork-for-quality-a-review-of-sidewinder-creative-missile-development-at-china-lake-by-ron-westrum/',
    quote:
      'The development of the Sidewinder missile is a successful example of how to run a creative research and development team.',
    relatedBookId: 'sidewinder',
  },
  {
    title:
      'How to get the most from the constraint on your (testing) process – A review of The Phoenix Project by Gene Kim, Kevin Behr, and George Spafford',
    author: 'Mike Harris',
    date: '2026.06.02',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2026/06/02/how-to-get-the-most-from-the-constraint-on-your-testing-process-the-phoenix-project-by-gene-kim-kevin-behr-and-george-spafford/',
    quote:
      'This novel is a gateway to learning because it shows how the company also benefits from using the four types of work and the three ways, and many other techniques.',
    relatedBookId: 'phoenix-project',
  },
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
    excerpt:
      'We can learn a great deal from William Scherkenbach about how to operationalize the Deming philosophy — in business, government, and academia.',
    relatedBookId: 'demings-road',
  },
  {
    title:
      'We Can Learn So Much From How AI Got Here — a review of Rebels of Reason by John Willis with Derek Lewis',
    author: 'Mike Harris',
    date: '2025.06.10',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2025/06/10/we-can-learn-so-much-from-how-ai-got-here-a-review-of-rebels-of-reason-by-john-willis-with-derek-lewis/',
    quote:
      'Testing professionals need to develop an understanding of AI that will help us to test applications that use AI and utilise tools that incorporate AI.',
    relatedBookId: 'rebels-of-reason',
  },
  {
    title:
      'A Great Resource for Leaders in Test and Quality — a review of Learning to Lead, Leading to Learn by Katie Anderson',
    author: 'Mike Harris',
    date: '2024.09.24',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2024/09/24/a-great-resource-for-leaders-in-test-and-quality-a-review-of-learning-to-lead-leading-to-learn-by-katie-anderson/',
    quote:
      'If you are a Test/QE/QA Manager or Lead or want to become one this book will give you many insights that will help you build your own chain of learning to become a people-centred leader.',
    relatedBookId: 'learning-to-lead',
  },
  {
    title: 'Think Slowly When You Are Testing — and Think Slowly When You Are Automating',
    author: 'Mike Harris',
    date: '2024.04.16',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2024/04/16/think-slowly-when-you-are-testing-and-think-slowly-when-you-are-automating/',
    quote:
      'When we test and when we automate there are benefits in “Slowing ourselves down so that we can be more deliberative and self-reflective”',
    relatedBookId: 'wiring-winning-org',
  },
  {
    title: 'Get Insights from The World of W. Edwards Deming by Cecelia S. Kilian',
    author: 'Mike Harris',
    date: '2024.02.20',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2024/02/20/get-insights-from-the-world-of-w-edwards-deming-by-cecelia-s-kilian/',
    quote:
      'The details of Deming’s life are interesting, however I am interested in him because I want the same things he did. I want companies to be successful businesses by continually improving the quality of their products and services.',
    relatedBookId: 'world-of-deming',
  },
  {
    title: 'A Review of Understanding Variation — The Key to Managing Chaos by Donald J. Wheeler',
    author: 'Mike Harris',
    date: '2024.01.23',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2024/01/23/a-review-of-understanding-variation-the-key-to-managing-chaos-by-donald-j-wheeler/',
    quote:
      'This book can help you start to use control charts to analyse data from your test and development processes.',
    relatedBookId: 'twenty-things',
  },
  {
    title: "A Review of Deming's Journey to Profound Knowledge by John Willis with Derek Lewis",
    author: 'Mike Harris',
    date: '2023.10.03',
    platform: 'Blog',
    source: 'Test & Analysis',
    url: 'https://testandanalysis.home.blog/2023/10/03/a-review-of-demings-journey-to-profound-knowledge-by-john-botchagalupe-willis-with-derek-lewis/',
    quote:
      'W. Edwards Deming is often referred to as the “grandfather of quality”, and this new well-researched book about him and his philosophy gives us many new and useful insights.',
    relatedBookId: 'demings-journey',
  },
];
