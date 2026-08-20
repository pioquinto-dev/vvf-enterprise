// All content here is placeholder/dummy data for the MVP.

export const NAV_LINKS = [
  { label: 'Features', href: '#top' },
  { label: 'Pricing', href: '#top' },
  { label: 'Blog', href: '#top' },
  { label: 'Consulting', href: '#top' },
  { label: 'Affiliate', href: '#top' },
  { label: 'Extension', href: '#top' },
];

export const BRANDS = [
  { name: 'Glossier', category: 'Beauty', reach: '4.2M', logo: '/landing/brands/glossier.svg' },
  { name: 'GoPure', category: 'Skincare', reach: '1.8M', logo: '/landing/brands/gopure.svg' },
  { name: 'Ridge', category: 'Accessories', reach: '3.1M', logo: '/landing/brands/ridge.svg' },
  { name: 'Olipop', category: 'Beverage', reach: '6.7M', logo: '/landing/brands/olipop.svg' },
  { name: 'Caraway', category: 'Home', reach: '2.4M', logo: '/landing/brands/caraway.svg' },
  { name: 'Loops', category: 'Skincare', reach: '980K', logo: '/landing/brands/loops.svg' },
  { name: 'Hexclad', category: 'Kitchen', reach: '5.3M', logo: '/landing/brands/hexclad.svg' },
  { name: 'Vessi', category: 'Footwear', reach: '1.2M', logo: '/landing/brands/vessi.svg' },
  { name: 'Bala', category: 'Fitness', reach: '2.9M', logo: '/landing/brands/bala.svg' },
  { name: 'Mud\\Wtr', category: 'Beverage', reach: '3.8M', logo: '/landing/brands/mudwtr.svg' },
  { name: 'Solawave', category: 'Beauty Tech', reach: '4.6M', logo: '/landing/brands/solawave.svg' },
  { name: 'Jones Road', category: 'Beauty', reach: '7.1M', logo: '/landing/brands/jones-road.svg' },
];

export const FEATURES = [
  {
    id: 'outliers',
    tag: 'Discovery',
    title: 'Outlier Vault',
    body: 'Surface the TikToks in your category that broke out this week — the ones running 10x above the creator’s own baseline, not just the ones with big follower counts.',
    bullets: ['Outlier scoring vs creator baseline', 'Last 7 / 30 / 90 day windows', 'Sound, hashtag and format tags'],
    accent: 'from-[#3a2b6b] to-[#8b3df0]',
  },
  {
    id: 'competitors',
    tag: 'Monitoring',
    title: 'Competitor Tracking',
    body: 'Point Brand Beacon at a competitor and get a running feed of every video mentioning them - organic creator posts, affiliate content, and paid spark ads alike.',
    bullets: ['Unlimited competitor bookmarks', 'Weekly change digest', 'Share-of-voice trendline'],
    accent: 'from-[#0f3d5c] to-[#2aa7c4]',
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
    body: 'Save the search and Brand Beacon re-runs it on a schedule, emailing you only what is new.',
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
      'The outlier scoring is the part that matters. Big accounts posting mediocre videos are noise. Brand Beacon filters those out by default.',
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
      'I ran one free search to test it and forwarded the results to my CMO the same afternoon. We were on Scale by the end of the week.',
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
      slug: 'free',
      name: 'Free',
      price: 0,
      tagline: 'One search, no card.',
      cta: 'Run a free search',
      features: ['1 free search', '0 video bookmarks', '0 search bookmarks', '0 video analysis'],
      searchCreditsLimit: 1,
      searchCreditsUsed: 0,
      bookmarkLimit: 0,
      bookmarksUsed: 0,
      videoBookmarkLimit: 0,
      videoBookmarkUsed: 0,
      searchBookmarkLimit: 0,
      searchBookmarkUsed: 0,
      videoAnalysisLimit: 0,
      videoAnalysisUsed: 0,
      trialEnabled: true,
    },
    {
      slug: 'basic',
      name: 'Growth',
      price: 79,
      tagline: 'For a single brand.',
      cta: 'Choose Growth',
      popular: true,
      features: [
        '150 searches',
        '50 video bookmarks',
        '50 search bookmarks',
        '50 video analysis',
        'Weekly + monthly scheduling',
        'CSV export for reports',
        'Virality alerts',
      ],
      searchCreditsLimit: 150,
      searchCreditsUsed: 0,
      bookmarkLimit: 50,
      bookmarksUsed: 0,
      videoBookmarkLimit: 50,
      videoBookmarkUsed: 0,
      searchBookmarkLimit: 50,
      searchBookmarkUsed: 0,
      videoAnalysisLimit: 50,
      videoAnalysisUsed: 0,
      trialEnabled: true,
    },
    {
      slug: 'premium',
      name: 'Scale',
      price: 199,
      tagline: 'For brand and agency teams.',
      cta: 'Choose Scale',
      features: [
        '400 searches',
        'Unlimited bookmarks',
        'Weekly + monthly scheduling',
        'Virality alerts',
        'CSV export for reports',
      ],
      searchCreditsLimit: 400,
      searchCreditsUsed: 0,
      bookmarkLimit: -1,
      bookmarksUsed: 0,
      videoBookmarkLimit: -1,
      videoBookmarkUsed: 0,
      searchBookmarkLimit: -1,
      searchBookmarkUsed: 0,
      videoAnalysisLimit: -1,
      videoAnalysisUsed: 0,
      trialEnabled: true,
    },
  ],
};

export const PRICING_PLAN_ORDER = PRICING.monthly.map((plan) => plan.slug ?? plan.name.toLowerCase());

export const FAQS = [
	{
		q: "What counts as one search?",
		a: "One subject — your brand, a single competitor, or a single product — included are any keywords you attach to widen the search. All of those keywords are covered by that one search, so ticking six terms still only spend one."
	},
	{
		q: "How long does a search take?",
		a: "Most finish in under 5 minutes, but can take up to 20 minutes. You can stay on the results page and watch it fill in, or close the tab and we will email you the moment it is ready."
	},
	{
		q: "Why focus on outliers instead of follower count?",
		a: "A video with 4 million views from a creator with 4 million followers is great, but a video with 4 million views from a creator with 4 thousand followers is something to pay attention to. That video is the outlier, something that performs better than average - that's what we want to track."
	},
  {
    q: 'What happens after the 7 day trial?',
    a: 'The trial converts to Growth at $79/mo unless you cancel before day 7. Cancelling takes two clicks in account settings — no call, no form.',
  },
  {
    q: 'Is the data real-time?',
    a: 'Effectively, yes. Our collection infrastructure tracks Tiktok at scale and routes new videos through the index within hours of them going live. Every index video is continuously re-evaluated against our outlier scoring engine, so the rankings you see are always tied to live performance.',
  }
];

export const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: ['Outlier Vault', 'Competitor Tracking', 'Creator Shortlists', 'Virality Alerts', 'Changelog'],
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
    label: 'Brand',
    placeholder: 'Enter brand name',
    sectionHeading: 'Add terms to expand on your brand',
    sample: 'rhode skin',
    keywords: ['beauty', 'skincare', 'eye gel', 'serum', 'reviews', 'routine'],
  },
  competitor: {
    key: 'competitor',
    label: 'Competitor',
    placeholder: 'Enter one competitor',
    sectionHeading: 'Add terms to expand on this competitor',
    sample: 'skims',
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
