import LegalPage from './LegalPage.jsx';

const sections = [
  {
    heading: '1. Acceptance of These Terms',
    paragraphs: [
      'These Terms of Service govern your access to and use of Brand Beacon, including our website, applications, search workflows, analytics tools, subscriptions, and related services. By using Brand Beacon, you agree to these Terms.',
      'If you are using Brand Beacon on behalf of a company or other organization, you represent that you have authority to bind that organization to these Terms.',
    ],
  },
  {
    heading: '2. Eligibility and Accounts',
    paragraphs: [
      'You must provide accurate account information and keep your login credentials secure. You are responsible for activity that occurs under your account and for promptly notifying us of any unauthorized use.',
      'We may suspend or terminate accounts that violate these Terms, create risk for Brand Beacon or others, or are used in a fraudulent, abusive, or unlawful manner.',
    ],
  },
  {
    heading: '3. The Service',
    paragraphs: [
      'Brand Beacon helps users discover, monitor, and analyze short-form video trends, related search results, and associated performance signals. Features may change over time, and some features may depend on third-party platforms or service providers.',
      'We may add, modify, limit, or discontinue features at any time. We do not guarantee uninterrupted availability of every feature or data source.',
    ],
  },
  {
    heading: '4. Subscriptions, Trials, and Billing',
    paragraphs: [
      'Paid features may require a subscription, trial enrollment, or other fee-based access. By purchasing a plan, you authorize us and our billing providers to charge the applicable fees, taxes, and renewal amounts using your selected payment method.',
      'Unless otherwise stated, subscriptions renew automatically until canceled. Trial eligibility, feature limits, usage caps, and pricing are determined by the plan presented at the time of purchase.',
      'You are responsible for reviewing plan details before purchase. Except where required by law, fees are non-refundable once charged.',
    ],
  },
  {
    heading: '5. Acceptable Use',
    paragraphs: [
      'You may not use Brand Beacon to violate law, infringe others’ rights, attempt unauthorized access, interfere with the service, reverse engineer protected parts of the product except where prohibited by law, or use automated means to extract or republish the service in a way that competes with, harms, or overloads Brand Beacon.',
      'You may not use the service to store or transmit malicious code, evade plan limits, resell access without permission, or misuse third-party data surfaced through the product.',
    ],
  },
  {
    heading: '6. Customer Content and Inputs',
    paragraphs: [
      'You retain rights in the content and inputs you submit to the service, such as searches, keywords, account information, and support communications. You grant Brand Beacon a non-exclusive right to host, process, transmit, and use that information as needed to operate and improve the service.',
      'You are responsible for ensuring that your inputs and use of the service comply with applicable law and do not violate third-party rights.',
    ],
  },
  {
    heading: '7. Data Sources and Results',
    paragraphs: [
      'Brand Beacon may rely on third-party platforms, infrastructure providers, and data-processing services. Search results, analytics, rankings, media availability, and other outputs may vary over time and may be incomplete, delayed, removed, or unavailable.',
      'You understand that outputs are provided for business insight and workflow support, not as legal, financial, or professional advice.',
    ],
  },
  {
    heading: '8. Intellectual Property',
    paragraphs: [
      'Brand Beacon and its related software, design, content, trademarks, and service materials are owned by us or our licensors and are protected by law. Except for the limited right to use the service under these Terms, no rights are granted to you.',
    ],
  },
  {
    heading: '9. Termination',
    paragraphs: [
      'You may stop using the service at any time. We may suspend or terminate your access if you violate these Terms, create legal or operational risk, fail to pay applicable fees, or if we discontinue the service.',
      'Sections that by their nature should survive termination will survive, including provisions on payment obligations, intellectual property, disclaimers, limitation of liability, indemnity, and dispute-related terms.',
    ],
  },
  {
    heading: '10. Disclaimers',
    paragraphs: [
      'Brand Beacon is provided on an “as is” and “as available” basis. To the fullest extent permitted by law, we disclaim warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, title, and non-infringement.',
    ],
  },
  {
    heading: '11. Limitation of Liability',
    paragraphs: [
      'To the fullest extent permitted by law, Brand Beacon and its affiliates, officers, employees, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, revenues, goodwill, data, or business opportunities arising from or related to the service.',
      'To the fullest extent permitted by law, our total liability for claims arising out of or relating to Brand Beacon will not exceed the amount you paid us for the service during the 12 months before the event giving rise to the claim, or one hundred U.S. dollars if you have not made any payments.',
    ],
  },
  {
    heading: '12. Indemnity',
    paragraphs: [
      'You agree to defend, indemnify, and hold harmless Brand Beacon and its affiliates, officers, employees, and agents from and against claims, liabilities, damages, losses, and expenses arising out of or related to your use of the service, your content or inputs, or your violation of these Terms or applicable law.',
    ],
  },
  {
    heading: '13. Changes to These Terms',
    paragraphs: [
      'We may update these Terms from time to time. If we make material changes, we will post the updated Terms and may provide additional notice through the service or by email. Your continued use of Brand Beacon after the updated Terms take effect means you accept the revised Terms.',
    ],
  },
  {
    heading: '14. Contact',
    paragraphs: [
      'Questions about these Terms may be sent to hello@brandbeacon.com.',
    ],
  },
];

export default function TermsOfService() {
  return <LegalPage title="Terms of Service" effectiveDate="August 29, 2026" sections={sections} />;
}
