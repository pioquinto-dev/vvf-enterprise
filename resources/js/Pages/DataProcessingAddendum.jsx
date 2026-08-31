import LegalPage from './LegalPage.jsx';

const sections = [
  {
    heading: '1. Scope of This Addendum',
    paragraphs: [
      'This Data Processing Addendum applies when Brand Beacon processes personal data on behalf of a customer in connection with the services covered by our Terms of Service. It supplements those Terms and applies only to the extent Brand Beacon is acting as a processor or service provider for customer personal data.',
      'If there is any conflict between this Addendum and the Terms of Service regarding data-processing obligations, this Addendum controls to the extent of that conflict.',
    ],
  },
  {
    heading: '2. Roles of the Parties',
    paragraphs: [
      'The customer is the controller or business, and Brand Beacon is the processor or service provider, for customer personal data processed through the service on the customer’s behalf.',
      'Each party will comply with the obligations applicable to it under relevant data-protection laws.',
    ],
  },
  {
    heading: '3. Subject Matter and Duration',
    paragraphs: [
      'Brand Beacon processes customer personal data for the purpose of providing the service, including account administration, authentication, search operations, analytics delivery, support, billing administration, service security, troubleshooting, and related operational functions.',
      'Processing continues for the duration of the customer’s use of the service, plus any limited retention period reasonably required for legal compliance, security, backup integrity, dispute resolution, or other legitimate business needs.',
    ],
  },
  {
    heading: '4. Nature of Processing and Types of Data',
    paragraphs: [
      'Processing may include collection, organization, storage, retrieval, consultation, transmission, analysis, deletion, and other actions necessary to operate the service.',
      'Customer personal data may include account identifiers, contact information, billing-related metadata, support communications, saved searches, usage records, settings, and other information the customer or its authorized users submit to or generate through the service.',
    ],
  },
  {
    heading: '5. Customer Instructions',
    paragraphs: [
      'Brand Beacon will process customer personal data only on documented instructions from the customer, including as necessary to provide the service under the Terms of Service and this Addendum, unless otherwise required by applicable law.',
      'If Brand Beacon believes an instruction violates applicable law, it may notify the customer and suspend the affected processing until the issue is resolved.',
    ],
  },
  {
    heading: '6. Confidentiality and Personnel',
    paragraphs: [
      'Brand Beacon will ensure that personnel authorized to process customer personal data are subject to appropriate confidentiality obligations and access controls.',
    ],
  },
  {
    heading: '7. Security Measures',
    paragraphs: [
      'Brand Beacon will implement reasonable technical and organizational measures designed to protect customer personal data against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or unauthorized access.',
      'Those measures may include access restrictions, role-based permissions, authentication controls, logging, vendor security review, encrypted transmission, and other measures appropriate to the nature of the service.',
    ],
  },
  {
    heading: '8. Subprocessors',
    paragraphs: [
      'The customer authorizes Brand Beacon to use subprocessors that are reasonably necessary to provide the service, including providers supporting hosting, storage, authentication, billing, communications, monitoring, and operational infrastructure.',
      'Brand Beacon will remain responsible for the performance of its subprocessors to the extent required by applicable law and will impose data-protection obligations on subprocessors as appropriate for the services they provide.',
    ],
  },
  {
    heading: '9. Assistance with Data Subject Requests',
    paragraphs: [
      'Taking into account the nature of the processing, Brand Beacon will provide reasonable assistance to the customer in responding to requests from data subjects where the customer cannot address the request through the service itself.',
    ],
  },
  {
    heading: '10. Assistance with Compliance',
    paragraphs: [
      'Brand Beacon will provide reasonable information to help the customer meet obligations relating to security, breach notification, impact assessments, and consultations with regulators, to the extent required by applicable law and reasonably possible given the nature of the service.',
    ],
  },
  {
    heading: '11. Security Incident Notification',
    paragraphs: [
      'If Brand Beacon becomes aware of a confirmed security incident affecting customer personal data, Brand Beacon will notify the customer without undue delay and provide available information reasonably necessary to help the customer understand the incident and meet applicable notification obligations.',
    ],
  },
  {
    heading: '12. Return or Deletion of Data',
    paragraphs: [
      'Upon termination of the relevant services, Brand Beacon will delete or return customer personal data as required by applicable law and the Terms of Service, except where retention is required for legal, security, backup, accounting, or dispute-resolution purposes.',
    ],
  },
  {
    heading: '13. International Transfers',
    paragraphs: [
      'Customer personal data may be processed in jurisdictions outside the customer’s own jurisdiction where Brand Beacon or its subprocessors operate. Where required by applicable law, the parties will cooperate in implementing appropriate transfer mechanisms.',
    ],
  },
  {
    heading: '14. Contact',
    paragraphs: [
      'Questions regarding this Data Processing Addendum may be sent to hello@brandbeacon.com.',
    ],
  },
];

export default function DataProcessingAddendum() {
  return <LegalPage title="Data Processing Addendum" effectiveDate="August 29, 2026" sections={sections} />;
}
