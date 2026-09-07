/**
 * Fallback example breakouts for the cold-free-user "while you wait" screen
 * (M4 / M4b), used only when the backend has no real showcase breakouts to send
 * (e.g. an empty corpus in local dev). In production the server supplies real
 * top breakouts pulled from the viral-video corpus; see
 * SavedSearchController::freeSearchShowcase().
 *
 * Shape is shared with the real data so RunningScreen renders either the same:
 *   { id, handle, tag, caption, score, gradient, thumbnail?,
 *     summary, rows: [{label,text}], stats: [{label,value,accent?}], beats? }
 *
 * These carry no real thumbnails, so each falls back to a stable `gradient`.
 */
export const EXAMPLE_BREAKOUTS = [
  {
    id: 'olipop-fridge',
    tag: 'olipop',
    handle: '@quietkitchen.co',
    caption: 'The fridge restock she films at two in the morning.',
    score: '88x',
    gradient: 'linear-gradient(150deg,#3a2b6b,#6a3ca8 55%,#c07a9a)',
    summary: '1,400,000 views, off an account that normally does 16,000.',
    rows: [
      { label: 'Hook', text: '“Do not buy this until you have seen the back of the bottle.”' },
      { label: 'Format', text: 'One take, phone on the counter, no cuts, no captions.' },
      { label: 'Why', text: 'She never says the product name.' },
    ],
    stats: [
      { label: 'Views', value: '1.4M' },
      { label: 'Her usual', value: '16K' },
      { label: 'Beat her own account by', value: '88x', accent: true },
      { label: 'Paid partnership', value: 'None' },
    ],
    beats: [
      { ts: '0:00', text: 'The can is already open and already in her hand. ', strong: 'No introduction, no face, no hello.' },
      { ts: '0:04', text: 'She is restocking a fridge, which is the whole video. The product is furniture in somebody’s night, ', strong: 'not the subject', tail: '.' },
      { ts: '0:31', strong: 'She never says the brand name once.', tail: ' The comments say it 340 times.' },
    ],
  },
  {
    id: 'castiron-garage',
    tag: 'field co.',
    handle: '@castiron.dad',
    caption: 'The guy seasoning a pan in his garage',
    score: '61x',
    gradient: 'linear-gradient(150deg,#2f3d2b,#4a5c3a 55%,#7aa060)',
    summary: '980,000 views, off an account that normally does 11,000.',
    rows: [
      { label: 'Hook', text: '“Everyone gets this part wrong.”' },
      { label: 'Format', text: 'Static shot of a workbench, hands only, one continuous take.' },
      { label: 'Why', text: 'A quiet process video that reads as expertise, not an ad.' },
    ],
    stats: [
      { label: 'Views', value: '980K' },
      { label: 'His usual', value: '11K' },
      { label: 'Beat his own account by', value: '61x', accent: true },
      { label: 'Paid partnership', value: 'None' },
    ],
    beats: [
      { ts: '0:00', strong: 'No hook line, no music.', text: ' Just a pan, a paper towel, and a low burner.' },
      { ts: '0:12', text: 'He wipes the same spot four times. ', strong: 'The repetition is the retention.' },
      { ts: '0:45', text: 'The brand shows for two frames on the box in the corner. ', strong: 'Nobody skips to check it — they already trust him.' },
    ],
  },
  {
    id: 'rental-unboxing',
    tag: 'our place',
    handle: '@firstflat.era',
    caption: 'Unboxing it in a rental with no counter space',
    score: '44x',
    gradient: 'linear-gradient(150deg,#5c1030,#a8324f 55%,#ff8fb0)',
    summary: '620,000 views, off an account that normally does 14,000.',
    rows: [
      { label: 'Hook', text: '“There is genuinely nowhere to put this.”' },
      { label: 'Format', text: 'Handheld, filmed on the floor because the counter is full.' },
      { label: 'Why', text: 'The constraint is the story — the mess makes it believable.' },
    ],
    stats: [
      { label: 'Views', value: '620K' },
      { label: 'Her usual', value: '14K' },
      { label: 'Beat her own account by', value: '44x', accent: true },
      { label: 'Paid partnership', value: 'None' },
    ],
    beats: [
      { ts: '0:00', strong: 'She apologizes for the mess first.', text: ' It disarms the whole video.' },
      { ts: '0:09', text: 'The box opens on the floor between two boxes still taped shut. ', strong: 'Everyone in a small flat sees themselves.' },
      { ts: '0:22', strong: 'She never recommends it.', tail: ' She just uses it and moves on.' },
    ],
  },
  {
    id: 'back-pocket',
    tag: 'nomatic',
    handle: '@carryon.only',
    caption: 'Six months in a back pocket, on camera',
    score: '39x',
    gradient: 'linear-gradient(150deg,#0f3d5c,#2a6f9c 55%,#7ab6d8)',
    summary: '540,000 views, off an account that normally does 15,000.',
    rows: [
      { label: 'Hook', text: '“This is what six months of abuse looks like.”' },
      { label: 'Format', text: 'A single close-up, rotating the product slowly in the light.' },
      { label: 'Why', text: 'Proof over promise — the wear is the whole pitch.' },
    ],
    stats: [
      { label: 'Views', value: '540K' },
      { label: 'His usual', value: '15K' },
      { label: 'Beat his own account by', value: '39x', accent: true },
      { label: 'Paid partnership', value: 'None' },
    ],
    beats: [
      { ts: '0:00', strong: 'The damage is the first frame.', text: ' No before, only after.' },
      { ts: '0:15', text: 'He lists what it survived, ', strong: 'not what it does.' },
      { ts: '0:28', strong: 'The one line people quoted:', tail: ' “still closes like day one.”' },
    ],
  },
  {
    id: 'one-star-reviews',
    tag: 'liquid death',
    handle: '@saysitback',
    caption: 'Reading her own one-star reviews out loud',
    score: '31x',
    gradient: 'linear-gradient(150deg,#4a2b1a,#8a5230 55%,#d69a6a)',
    summary: '410,000 views, off an account that normally does 13,000.',
    rows: [
      { label: 'Hook', text: '“Let’s read the ones that hate it.”' },
      { label: 'Format', text: 'Talking head, deadpan, reading a phone in one hand.' },
      { label: 'Why', text: 'Leaning into the criticism reads as confidence, and confidence sells.' },
    ],
    stats: [
      { label: 'Views', value: '410K' },
      { label: 'Her usual', value: '13K' },
      { label: 'Beat her own account by', value: '31x', accent: true },
      { label: 'Paid partnership', value: 'None' },
    ],
    beats: [
      { ts: '0:00', strong: 'She reads the worst review first.', text: ' The comments beg her to keep going.' },
      { ts: '0:18', text: 'Each complaint gets a one-word answer. ', strong: 'No defensiveness, no pitch.' },
      { ts: '0:36', strong: 'The last review is a compliment', tail: ' — and it lands ten times harder for the setup.' },
    ],
  },
];
