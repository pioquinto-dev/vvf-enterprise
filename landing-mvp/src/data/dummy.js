// All content here is placeholder/dummy data for the MVP.

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#customers' },
  { label: 'FAQ', href: '#faq' },
];

export const BRANDS = [
  { name: 'Glossier', category: 'Beauty', reach: '4.2M' },
  { name: 'GoPure', category: 'Skincare', reach: '1.8M' },
  { name: 'Ridge', category: 'Accessories', reach: '3.1M' },
  { name: 'Olipop', category: 'Beverage', reach: '6.7M' },
  { name: 'Caraway', category: 'Home', reach: '2.4M' },
  { name: 'Loops', category: 'Skincare', reach: '980K' },
  { name: 'Hexclad', category: 'Kitchen', reach: '5.3M' },
  { name: 'Vessi', category: 'Footwear', reach: '1.2M' },
  { name: 'Bala', category: 'Fitness', reach: '2.9M' },
  { name: 'Mud\\Wtr', category: 'Beverage', reach: '3.8M' },
  { name: 'Solawave', category: 'Beauty Tech', reach: '4.6M' },
  { name: 'Jones Road', category: 'Beauty', reach: '7.1M' },
];

export const FEATURES = [
  {
    id: 'outliers',
    tag: 'Discovery',
    title: 'Viral Video Finder',
    body: 'Surface the TikToks in your category that broke out this week — the ones running 10x above the creator’s own baseline, not just the ones with big follower counts.',
    bullets: ['Outlier scoring vs creator baseline', 'Last 7 / 30 / 90 day windows', 'Sound, hashtag and format tags'],
    accent: 'from-[#3a2b6b] to-[#8b3df0]',
  },
  {
    id: 'competitors',
    tag: 'Monitoring',
    title: 'Competitor Tracking',
    body: 'Point VVF at a competitor and get a running feed of every video mentioning them — organic creator posts, affiliate content, and paid spark ads alike.',
    bullets: ['Unlimited competitor watchlists', 'Weekly change digest', 'Share-of-voice trendline'],
    accent: 'from-[#0f3d5c] to-[#2aa7c4]',
  },
  {
    id: 'creators',
    tag: 'Sourcing',
    title: 'Creator Shortlists',
    body: 'Every viral video comes attached to a creator. Filter by engagement, posting cadence, and category fit, then export a shortlist your team can actually reach out to.',
    bullets: ['Engagement + consistency scores', 'CSV export', 'Dedupe against past outreach'],
    accent: 'from-[#5c1030] to-[#ff3d71]',
  },
  {
    id: 'alerts',
    tag: 'Automation',
    title: 'Virality Alerts',
    body: 'Get pinged the moment a video mentioning your brand crosses a threshold you set. Catch the good ones early, and the bad ones earlier.',
    bullets: ['Threshold + velocity triggers', 'Slack and email delivery', 'Per-search mute rules'],
    accent: 'from-[#173a2a] to-[#3fbf7a]',
  },
];

export const STEPS = [
  {
    n: '01',
    title: 'Name one subject',
    body: 'Your brand, one competitor, or one product. One subject per search keeps every result readable.',
  },
  {
    n: '02',
    title: 'Widen with keywords',
    body: 'We suggest the terms people actually pair with your subject on TikTok. Tick the ones that fit.',
  },
  {
    n: '03',
    title: 'Get the viral cut',
    body: 'We scan hundreds of videos and hand back the top performers, ranked by views and outlier score.',
  },
  {
    n: '04',
    title: 'Track it weekly',
    body: 'Save the search and VVF re-runs it on a schedule, emailing you only what is new.',
  },
];

export const STATS = [
  { value: '62B+', label: 'Views analyzed' },
  { value: '4.1M', label: 'Videos indexed' },
  { value: '11K', label: 'Brands tracked' },
  { value: '<20min', label: 'Median search time' },
];

export const TESTIMONIALS = [
  {
    quote:
      'We found the creator driving 40% of our category’s TikTok volume in the first search. She was not on any agency list we had been sent.',
    name: 'Dana Whitfield',
    role: 'Head of Growth',
    company: 'Loops Beauty',
    initials: 'DW',
  },
  {
    quote:
      'Our competitive readout used to be a Friday afternoon of scrolling. Now it lands in Slack on Monday morning and it is more complete.',
    name: 'Marcus Idowu',
    role: 'Brand Marketing Lead',
    company: 'Caraway',
    initials: 'MI',
  },
  {
    quote:
      'The outlier scoring is the part that matters. Big accounts posting mediocre videos are noise. VVF filters those out by default.',
    name: 'Priya Raman',
    role: 'Social Director',
    company: 'Olipop',
    initials: 'PR',
  },
  {
    quote:
      'We caught a product complaint trending at 200K views before it hit 2M. That alert alone paid for the year.',
    name: 'Tom Bexley',
    role: 'VP Communications',
    company: 'Hexclad',
    initials: 'TB',
  },
  {
    quote:
      'I ran one free search to test it and forwarded the results to my CMO the same afternoon. We were on Premium by the end of the week.',
    name: 'Sofia Marchetti',
    role: 'Performance Manager',
    company: 'Vessi',
    initials: 'SM',
  },
  {
    quote:
      'It works for our niche, which is the thing every other tool failed at. Small category, still found 300 relevant videos.',
    name: 'Alex Kerrigan',
    role: 'Founder',
    company: 'Bala',
    initials: 'AK',
  },
];

export const PRICING = {
  monthly: [
    {
      name: 'Free',
      price: 0,
      tagline: 'One search, no card.',
      cta: 'Run a free search',
      features: ['1 free search', 'Last 90 days', 'Top 100 viral videos'],
    },
    {
      name: 'Basic',
      price: 79,
      tagline: 'For a single brand.',
      cta: 'Choose Basic',
      popular: true,
      features: [
        '150 searches',
        'Weekly + monthly scheduling',
        'CSV export for reports',
        'Virality alerts',
        '2 user seats',
      ],
    },
    {
      name: 'Premium',
      price: 199,
      tagline: 'For brand and agency teams.',
      cta: 'Choose Premium',
      features: [
        '300 searches',
        'Weekly + monthly scheduling',
        'Virality alerts',
        'CSV export for reports',
        '10 user seats',
      ],
    },
  ],
};

export const FAQS = [
  {
    q: 'What counts as one search?',
    a: 'One subject — your brand, a single competitor, or a single product — plus any keywords you attach to widen it. All of those keywords are covered by that one search, so ticking six terms still only spends one.',
  },
  {
    q: 'How long does a search take?',
    a: 'Most finish in under 20 minutes. You can stay on the results page and watch it fill in, or close the tab and we will email you the moment it is ready.',
  },
  {
    q: 'Why focus on outliers instead of follower count?',
    a: 'A 500K-follower account posting a 40K-view video tells you nothing. A 12K-follower account posting a 3M-view video tells you the format works. We rank by performance relative to the creator’s own baseline, so breakout content surfaces regardless of account size.',
  },
  {
    q: 'Do you cover niche categories?',
    a: 'Yes. The index is built from broad TikTok crawls rather than a curated brand list, so small categories still return meaningful volume. If a search comes back thin, we tell you rather than padding it with irrelevant results.',
  },
  {
    q: 'Can I track competitors I do not name upfront?',
    a: 'On Basic and above, each tracked search can watch a competitor continuously. Add them to a watchlist and VVF re-runs on your schedule, sending only what changed since last time.',
  },
  {
    q: 'What happens after the 10 day trial?',
    a: 'The trial converts to Basic at $79/mo unless you cancel before day 10. Cancelling takes two clicks in account settings — no call, no form.',
  },
  {
    q: 'Is the data real-time?',
    a: 'Close to it. Videos enter the index within a few hours of posting, and view counts on tracked videos refresh on every scheduled check.',
  },
  {
    q: 'Do you offer an annual plan?',
    a: 'Yes — annual billing takes about 20% off every paid tier. Toggle billing at the top of the pricing table to see the yearly rate.',
  },
];

export const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: ['Viral Video Finder', 'Competitor Tracking', 'Creator Shortlists', 'Virality Alerts', 'Changelog'],
  },
  {
    heading: 'Company',
    links: ['About', 'Careers', 'Blog', 'Press kit', 'Contact'],
  },
  {
    heading: 'Resources',
    links: ['TikTok benchmarks', 'Category reports', 'Help center', 'API docs', 'Status'],
  },
  {
    heading: 'Legal',
    links: ['Terms', 'Privacy', 'DPA', 'Security'],
  },
];

// ---------- Search flow dummy results ----------

export const SEARCH_TYPES = {
  brand: {
    key: 'brand',
    label: 'Your brand',
    placeholder: 'Enter your complete brand name',
    sectionHeading: 'Add terms to expand on your brand',
    sample: 'GoPure',
    keywords: ['beauty', 'skincare', 'eye gel', 'serum', 'reviews', 'routine'],
  },
  competitor: {
    key: 'competitor',
    label: 'Competitor',
    placeholder: 'Enter one competitor',
    sectionHeading: 'Add terms to expand on this competitor',
    sample: 'Glossier',
    keywords: ['review', 'dupe', 'haul', 'grwm', 'vs', 'viral'],
  },
  product: {
    key: 'product',
    label: 'Product',
    placeholder: 'Enter one product',
    sectionHeading: 'Add terms to expand on this product',
    sample: 'lip oil',
    keywords: ['review', 'how to use', 'before after', 'dupe', 'results', 'viral'],
  },
};

export const RESULT_VIDEOS = [
  {
    rank: 1,
    views: '4.2M',
    likes: '512K',
    comments: '3.1K',
    duration: '0:14',
    posted: '6 days ago',
    handle: '@glossier',
    caption: '“the only 3 products i use for that glazed donut skin” · grwm using the skin tint + balm',
    multiplier: '18x',
    gradient: 'from-[#3a2b6b] to-[#8b3df0]',
  },
  {
    rank: 2,
    views: '3.1M',
    likes: '401K',
    comments: '2.4K',
    duration: '0:21',
    posted: '9 days ago',
    handle: '@glowwithtay',
    caption: 'i tried the viral serum for 30 days — honest before and after',
    multiplier: '12x',
    gradient: 'from-[#0f3d5c] to-[#2aa7c4]',
  },
  {
    rank: 3,
    views: '2.8M',
    likes: '388K',
    comments: '1.9K',
    duration: '0:09',
    posted: '3 days ago',
    handle: '@cleangirl.ari',
    caption: 'the 9 second routine that replaced my whole shelf',
    multiplier: '22x',
    gradient: 'from-[#5c1030] to-[#ff3d71]',
  },
  {
    rank: 4,
    views: '1.9M',
    likes: '260K',
    comments: '1.2K',
    duration: '0:17',
    posted: '12 days ago',
    handle: '@glossier',
    caption: 'restocking the shelf · what actually sold out this month',
    multiplier: '7x',
    gradient: 'from-[#173a2a] to-[#3fbf7a]',
  },
  {
    rank: 5,
    views: '1.4M',
    likes: '190K',
    comments: '880',
    duration: '0:12',
    posted: '5 days ago',
    handle: '@mua.jess',
    caption: 'pro makeup artist reacts to the drugstore dupe everyone is buying',
    multiplier: '9x',
    gradient: 'from-[#4a3410] to-[#e0a83a]',
  },
  {
    rank: 6,
    views: '1.1M',
    likes: '142K',
    comments: '640',
    duration: '0:28',
    posted: '2 days ago',
    handle: '@thatskinguy',
    caption: 'dermatologist breaks down the ingredient list line by line',
    multiplier: '15x',
    gradient: 'from-[#2b1b52] to-[#5b34f5]',
  },
  {
    rank: 7,
    views: '980K',
    likes: '121K',
    comments: '512',
    duration: '0:11',
    posted: '8 days ago',
    handle: '@budgetbeautybri',
    caption: 'everything under $20 that actually works · part 4',
    multiplier: '6x',
    gradient: 'from-[#123a4a] to-[#37c8a0]',
  },
  {
    rank: 8,
    views: '870K',
    likes: '104K',
    comments: '470',
    duration: '0:19',
    posted: '11 days ago',
    handle: '@nightshiftnurse',
    caption: '12 hour shift skin check · what survived',
    multiplier: '11x',
    gradient: 'from-[#4a1240] to-[#d13fb0]',
  },
];
