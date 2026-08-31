import LegalPage from './LegalPage.jsx';

const sections = [
  {
    heading: '1. Information We Collect',
    paragraphs: [
      'We collect information you provide directly to us, including account details such as your name, email address, password, company or brand information, billing details, support messages, and any information you submit while creating or managing searches.',
      'We also collect service data generated through your use of Brand Beacon, such as saved searches, keywords, bookmarks, video-analysis requests, subscription status, usage counts, settings, and activity needed to operate the product.',
      'Like most online services, we may automatically collect technical and usage information such as IP address, browser type, device information, pages viewed, referring URLs, timestamps, and cookie or session data.',
    ],
  },
  {
    heading: '2. How We Use Information',
    paragraphs: [
      'We use information to provide, maintain, secure, and improve Brand Beacon, including operating search workflows, storing results, preserving media references, processing subscriptions, sending transactional messages, analyzing product usage, preventing abuse, and supporting customers.',
      'We may also use information to communicate with you about your account, product updates, pricing, legal notices, and marketing messages where permitted by law. You can opt out of non-essential marketing emails at any time.',
    ],
  },
  {
    heading: '3. Search Data and Third-Party Sources',
    paragraphs: [
      'Brand Beacon surfaces analytics, search results, and media-related information derived from third-party platforms and service providers. That information can change, become unavailable, or be removed by those platforms at any time.',
      'We may use service providers to help retrieve, process, enrich, host, store, deliver, or analyze data used within the product. We do not promise that third-party data will always be complete, current, or continuously available.',
    ],
  },
  {
    heading: '4. Sharing of Information',
    paragraphs: [
      'We may share information with vendors and service providers that help us operate Brand Beacon, including providers supporting authentication, billing, communications, infrastructure, storage, analytics, and search-related processing.',
      'We may also disclose information when reasonably necessary to comply with law, enforce our terms, protect the rights or safety of Brand Beacon, our users, or others, or in connection with a merger, financing, acquisition, or sale of assets.',
      'We do not sell your personal information for money.',
    ],
  },
  {
    heading: '5. Cookies and Similar Technologies',
    paragraphs: [
      'We use cookies, local storage, and similar technologies to keep you signed in, remember preferences, maintain sessions, attribute traffic, improve performance, and understand how the service is used.',
      'Your browser may allow you to block or remove cookies, but parts of Brand Beacon may not function properly if you do so.',
    ],
  },
  {
    heading: '6. Data Retention',
    paragraphs: [
      'We retain information for as long as reasonably necessary to provide the service, comply with legal obligations, resolve disputes, enforce agreements, and maintain business records.',
      'Search records, analytics, billing records, and related operational logs may persist for a period of time even after an account is closed or a deletion request is submitted where retention is necessary for security, legal, accounting, or legitimate business purposes.',
    ],
  },
  {
    heading: '7. Security',
    paragraphs: [
      'We use reasonable administrative, technical, and organizational measures designed to protect personal information. However, no system is perfectly secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    heading: '8. Your Choices and Rights',
    paragraphs: [
      'Depending on where you live, you may have rights to access, correct, delete, or restrict certain personal information, or to object to certain processing. You may also have the right to request a copy of certain information.',
      'To make a privacy request, contact us at hello@brandbeacon.com. We may need to verify your identity before completing your request.',
    ],
  },
  {
    heading: '9. Children',
    paragraphs: [
      'Brand Beacon is not directed to children, and we do not knowingly collect personal information from children under 13.',
    ],
  },
  {
    heading: '10. International Processing',
    paragraphs: [
      'Your information may be processed or stored in countries other than your own, including where our vendors or infrastructure providers operate. By using the service, you understand that information may be transferred to jurisdictions with different data-protection laws.',
    ],
  },
  {
    heading: '11. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. If we make material changes, we will post the updated version on this page and may provide additional notice through the product or by email where appropriate.',
    ],
  },
  {
    heading: '12. Contact Us',
    paragraphs: [
      'If you have questions about this Privacy Policy or our privacy practices, contact us at hello@brandbeacon.com.',
    ],
  },
];

export default function PrivacyPolicy() {
  return <LegalPage title="Privacy Policy" effectiveDate="August 29, 2026" sections={sections} />;
}
