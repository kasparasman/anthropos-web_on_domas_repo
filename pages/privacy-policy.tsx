import Head from 'next/head';
import React from 'react';

// Customize these values
const CONFIG = {
  companyName: 'Anthropos City',             // e.g. "Awesome Corp"
  contactEmail: 'info@anthroposcity.com',    // e.g. "support@awesome.com"
  mailingAddress: '',                        // e.g. "123 Main St, City, Country"
  lastUpdated: 'June 7, 2025',               // e.g. "June 7, 2025"
  currency: 'USD',                           // e.g. 'USD' or 'EUR'
  ageOfMajority: 18,
  coppaMinAge: 13,
  gdprMinAge: 16,
  jurisdiction: '',                          // e.g. 'State of X'
  arbitrationOrg: '',                        // e.g. 'American Arbitration Association'
};

export default function PrivacyPolicy() {
  const {
    companyName,
    contactEmail,
    mailingAddress,
    lastUpdated,
    ageOfMajority,
    coppaMinAge,
    gdprMinAge,
  } = CONFIG;

  return (
    <>
      <Head>
        <title>Privacy Policy</title>
      </Head>

      <main className="bg-black text-smoke min-h-screen p-8">
        <h1 className="text-3xl font-bold border-b border-smoke pb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-smoke mt-1">Last updated: {lastUpdated}</p>

        {/* Introduction */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Introduction</h2>
          <p className="mt-2 leading-relaxed">
            Your privacy matters. This Privacy Policy explains what information we collect from users of our Service, how we use and share that information, and your rights regarding your personal data. We are committed to compliance with global privacy laws, including the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), and to protecting your information. Please read this Policy carefully. By using the Service, you acknowledge that you have read and understood this Privacy Policy. If you do not agree, please do not use the Service.
          </p>
          <p className="mt-2 leading-relaxed">
            Data Controller: {companyName} (referred to as “we” or “us”) is the data controller responsible for the processing of personal data in connection with the Service. If you have any questions about this Policy or our data practices, you can contact us at <a href={`mailto:${contactEmail}`} className="underline">{contactEmail}</a> or at the address provided at the end of this Policy.
          </p>
          <p className="mt-2 leading-relaxed">
            Applicability: This Policy applies to all users worldwide. Additional privacy disclosures for specific jurisdictions (EU/UK, California, children’s privacy, etc.) are included below. We may provide translated versions of this Policy for convenience; in case of any conflict, the English version prevails (unless prohibited by local law).
          </p>
        </section>

        {/* You can continue adding sections following the same pattern:
            <section className="mt-8">
              <h2 className="text-2xl font-semibold">Section Title</h2>
              <p className="mt-2 leading-relaxed">Section content...</p>
            </section>
           
           Convert each numbered heading (1. Information We Collect, 2. Information We Collect Automatically, etc.) into its own <section> with appropriate <h2> or <h3> tags. Use <ul> or <ol> for lists.
        */}

        {/* Contact Us */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p className="mt-2 leading-relaxed">
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at:
          </p>
          <p className="mt-2 leading-relaxed">
            Email: <a href={`mailto:${contactEmail}`} className="underline">{contactEmail}</a><br />
            Address: {companyName}, {mailingAddress}
          </p>
        </section>
      </main>
    </>
  );
}
