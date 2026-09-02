import { Link } from '@inertiajs/react';

import { Comment } from './Icons.jsx';

export default function SupportLauncher() {
  return (
    <Link href="/support" className="support-launcher" aria-label="Open Brand Beacon support">
      <span>Quick FAQs</span>
      <i><Comment className="h-5 w-5" /></i>
    </Link>
  );
}
