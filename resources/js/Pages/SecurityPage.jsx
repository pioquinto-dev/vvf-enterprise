import LegalPage from './LegalPage.jsx';

const sections = [
  {
    heading: '1. Security Overview',
    paragraphs: [
      'Brand Beacon is designed with practical administrative, technical, and operational controls intended to protect customer accounts, application data, billing workflows, and service infrastructure.',
      'Our security program continues to evolve as the product, vendors, and threat environment change.',
    ],
  },
  {
    heading: '2. Access Controls',
    paragraphs: [
      'We limit access to systems and data based on role and business need. Administrative access is restricted to authorized personnel, and access may be reviewed, changed, or removed when responsibilities change.',
      'Customer account access is managed through application authentication controls, and users are responsible for maintaining the confidentiality of their credentials.',
    ],
  },
  {
    heading: '3. Infrastructure and Vendors',
    paragraphs: [
      'Brand Beacon relies on third-party infrastructure and service providers to support hosting, storage, billing, communications, authentication, monitoring, and related application operations.',
      'We select vendors based on product and operational needs and may review them for security, reliability, and fit for purpose as part of our vendor-management process.',
    ],
  },
  {
    heading: '4. Data Protection Measures',
    paragraphs: [
      'We use reasonable safeguards intended to protect data in transit and to limit unauthorized access to stored service data. Depending on the component, those safeguards may include encrypted transport, access restrictions, environment separation, logging, and least-privilege operational practices.',
      'No method of transmission or storage is perfectly secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    heading: '5. Monitoring and Response',
    paragraphs: [
      'We maintain operational monitoring and troubleshooting practices intended to detect service issues, abuse, failures, and potential security concerns.',
      'If we confirm a security incident affecting customer data, we aim to investigate, contain, remediate, and communicate appropriately based on the nature of the incident and our legal obligations.',
    ],
  },
  {
    heading: '6. Product Safeguards',
    paragraphs: [
      'Brand Beacon includes controls intended to reduce misuse and unintended exposure, such as authenticated access to account areas, server-side validation, billing and entitlement checks, audit-oriented activity records, and role-based controls for administrative features.',
    ],
  },
  {
    heading: '7. Backups and Availability',
    paragraphs: [
      'We may use backup, redundancy, and recovery-oriented practices appropriate to the service and infrastructure we operate. However, we do not guarantee that the service will be uninterrupted, error-free, or immune from outages caused by third-party providers or platform dependencies.',
    ],
  },
  {
    heading: '8. Customer Responsibilities',
    paragraphs: [
      'Customers play an important role in security. You should use strong passwords, protect account credentials, limit access to authorized team members, review account activity, and notify us promptly if you suspect unauthorized access or misuse.',
    ],
  },
  {
    heading: '9. Responsible Disclosure',
    paragraphs: [
      'If you believe you have identified a security issue affecting Brand Beacon, contact us at hello@brandbeacon.com with relevant details. Please avoid actions that could harm users, disrupt the service, or access data you are not authorized to access.',
    ],
  },
  {
    heading: '10. Contact',
    paragraphs: [
      'Security-related questions may be sent to hello@brandbeacon.com.',
    ],
  },
];

export default function SecurityPage() {
  return <LegalPage title="Security" effectiveDate="August 29, 2026" sections={sections} />;
}
