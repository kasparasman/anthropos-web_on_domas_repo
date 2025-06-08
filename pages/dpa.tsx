// pages/dpa.tsx
import React from 'react';
import Link from 'next/link';

// Constants for your company details
const COMPANY_NAME = "Anthropos City";
const COMPANY_EMAIL = "info@anthroposcity.com"; // Included for consistency, though not directly used in this DPA content
const WEBSITE_URL = "https://www.anthroposcity.com"; // Included for consistency, though not directly used in this DPA content
const COMPANY_JURISDICTION = "the Republic of Lithuania"; // Example jurisdiction, update as needed
const LAST_UPDATED_DATE = "June 8, 2025"; // Consistent with previous instruction

const DpaPage: React.FC = () => {
    return (
        <div className="w-full bg-[#111111] px-4 py-8 text-smoke">
            <h1 className="text-3xl font-bold mb-6">Data Processing Addendum (DPA)</h1>

            <p className="mb-4">
                This Data Processing Addendum (“DPA”) is for business or enterprise clients who use {COMPANY_NAME}’s Service and require a GDPR-compliant contract for the processing of personal data. If you are an individual consumer using our Service, this section is provided for transparency of our privacy commitments and may not apply directly to you. This DPA is incorporated by reference into our <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link> when applicable.
            </p>
            <p className="mb-4">
                <strong>Parties:</strong> This DPA is between (1) You, the user or customer acting as a Data Controller of Personal Data, and (2) {COMPANY_NAME}, acting as a Data Processor for certain Personal Data you may entrust to us under the Service (collectively the “Parties”).
            </p>
            <p className="mb-4">
                By using the Service in a manner where EU (or equivalent) personal data is provided to us and you are considered a Controller (e.g., if you input data about individuals other than yourself), you agree to this DPA. If you do not use the Service to process personal data on others’ behalf, this DPA may not be necessary.
            </p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">1. Definitions</h2>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>“Personal Data”</strong> means any information relating to an identified or identifiable natural person (“Data Subject”) that is processed under the Agreement.
                    </li>
                    <li>
                        <strong>“Controller”</strong> means the entity which determines the purposes and means of the processing of Personal Data. (In the context of our consumer service, that is typically us for the data you provide about yourself. In a business context, you might be the Controller and we the Processor if you are submitting third-party personal data to our Service.)
                    </li>
                    <li>
                        <strong>“Processor”</strong> means the entity which processes Personal Data on behalf of the Controller. (Here, {COMPANY_NAME} when acting on your instructions through the Service).
                    </li>
                    <li>
                        <strong>“Applicable Data Protection Law”</strong> means all data protection and privacy laws applicable to the respective party’s processing of Personal Data under the Agreement, including GDPR and any local implementations, and similar laws such as the UK GDPR, CCPA (to the extent applicable in a controller-processor context), etc.
                    </li>
                </ul>
                <p className="mb-4">
                    Other capitalized terms not defined herein shall have the meaning given to them in the main <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link> or <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">2. Details of Processing</h2>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Subject Matter:</strong> {COMPANY_NAME}’s provision of the Service to you, which involves processing of certain Personal Data as needed to provide features (e.g., if you upload or input personal data of individuals to our platform).
                    </li>
                    <li>
                        <strong>Duration:</strong> For the duration of the Agreement (<Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link>) between you and {COMPANY_NAME}, until deletion of all Personal Data as described herein.
                    </li>
                    <li>
                        <strong>Nature and Purpose:</strong> The nature of processing is the collection, storage, analysis, and such other operations as necessary to provide the Service’s functionality (which may include face recognition, avatar generation, etc.) to the Controller. The purpose of processing is determined by you as the Controller – generally to utilize {COMPANY_NAME}’s Service for identity verification, avatar generation, community interaction, etc., as described in the <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms</Link>.
                    </li>
                    <li>
                        <strong>Types of Personal Data:</strong> Could include identification data (e.g., facial images, biometric templates, email addresses), profile data (nicknames, avatars), contact information, online identifiers (IP, device ID), and any other data that users input. Special category data (biometric identifiers in facial images) is processed with explicit consent for the purpose of verification and personalization (<a href="https://www.thalesgroup.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">thalesgroup.com</a>).
                    </li>
                    <li>
                        <strong>Categories of Data Subjects:</strong> Individuals who use the Service or whose data is provided to the Service. This may include you (the end user) and any individuals who appear in data you submit (though our service is generally for personal use, not for uploading data about others). In a business context, this could be your end-users or employees if you are using our platform in that manner.
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">3. Obligations of Controller</h2>
                <p className="mb-4">
                    You, as Controller, shall:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        a. Ensure that you have obtained all necessary consents or have another valid legal basis for the Personal Data you submit to the Service. For example, if you were to upload a photo of another person for processing, you must have that person’s consent or other legal justification (note: our normal use-case expects you to upload your own face only).
                    </li>
                    <li>
                        b. Provide necessary privacy notices to Data Subjects whose data you process using our Service, if required by law.
                    </li>
                    <li>
                        c. Comply with your protection obligations under Applicable Data Protection Law, including only giving us instructions that are lawful and in accordance with such laws.
                    </li>
                    <li>
                        d. Remain responsible for your compliance and monitoring of {COMPANY_NAME}’s performance under this DPA.
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">4. Obligations of Processor (Company)</h2>
                <p className="mb-4">
                    We, as Processor, agree to:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        a. <strong>Act Only on Instructions:</strong> Process Personal Data only on documented instructions from you (the Controller). By using our Service and submitting data, your instructions are essentially to process the data to fulfill the functionalities of the Service. We will not use or process the data for any other purpose unless required by law. If a law requires us to process beyond your instructions, we will inform you (unless the law forbids such notice).
                    </li>
                    <li>
                        b. <strong>Confidentiality:</strong> Ensure that all persons we authorize to process the Personal Data (including our employees and contractors) are under appropriate obligations of confidentiality.
                    </li>
                    <li>
                        c. <strong>Security:</strong> Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, as outlined in our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>’s security section. This includes measures to protect data against unauthorized or unlawful processing, and against accidental loss, destruction, or damage (<a href="https://ilga.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ilga.gov</a>, <a href="https://ilga.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ilga.gov</a>). Specific measures include encryption, access controls, etc., as detailed above.
                    </li>
                    <li>
                        d. <strong>Sub-Processors:</strong> We have your general authorization to engage sub-processors that are necessary for providing the Service (e.g., our cloud providers, biometric engine, etc. listed in the <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>). We will ensure each sub-processor is bound by data protection obligations similar to those in this DPA (per Article 28 GDPR requirements). We remain liable for sub-processors’ performance. We will provide notice of any intended changes to sub-processors (e.g., by updating our Privacy Policy or via email) and give you the opportunity to object for legitimate reasons. If you object and we cannot accommodate it, you may terminate the Service.
                    </li>
                    <li>
                        e. <strong>Assistance with Data Subject Rights:</strong> Taking into account the nature of processing, we will assist you by appropriate technical and organizational measures, insofar as possible, to fulfill your obligation to respond to Data Subjects’ requests to exercise their rights (access, rectification, erasure, restriction, portability, objection, etc.). For example, if a Data Subject contacts us, we will redirect them to you or assist in retrieving, correcting, or deleting their data in our systems as per your instruction.
                    </li>
                    <li>
                        f. <strong>Assist with Compliance:</strong> We will also assist you in ensuring compliance with other applicable obligations (Art. 32-36 GDPR), such as helping with security of processing (we provide detailed info on measures for you to assess), breach notifications (we will notify you without undue delay if we become aware of a personal data breach affecting your data so you can fulfill any reporting duties), data protection impact assessments (we provide necessary info about our processing upon request), and prior consultations with authorities if needed.
                    </li>
                    <li>
                        g. <strong>Breach Notification:</strong> As stated, if we discover a data breach on our side that affects Personal Data subject to this DPA, we will notify you promptly (within 72 hours at most, sooner when feasible) with sufficient information to help you meet any obligations to notify authorities or individuals (<a href="https://www.thalesgroup.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">thalesgroup.com</a>). Our notification will include known details of the breach, likely consequences, and measures taken or proposed.
                    </li>
                    <li>
                        h. <strong>Deletion or Return of Data:</strong> Upon termination or expiration of our Agreement, at your choice and to the extent feasible, we will delete or return all Personal Data processed on your behalf, and delete existing copies, unless storage is required by law. (Our standard is to delete user data as described in the <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>; we can also export certain data for you upon request prior to deletion).
                    </li>
                    <li>
                        i. <strong>Audits:</strong> We will make available to you all information necessary to demonstrate compliance with our obligations under Article 28 GDPR and allow for and contribute to audits or inspections. We acknowledge your right to audit our processing of your Personal Data. However, to avoid unnecessary exposure of data or disruption, we may require audits to be conducted by an independent third party under confidentiality, during normal business hours, with reasonable notice. Alternatively, we may demonstrate compliance through third-party certifications and audit reports (e.g., SOC 2, ISO 27001) or by providing detailed documentation. You agree to consider those in satisfaction of audit requirements where possible. Any audits will be at your expense unless the law says otherwise.
                    </li>
                    <li>
                        j. <strong>International Transfers:</strong> For any transfers of Personal Data from the EEA/UK/Switzerland to outside those areas, we agree to abide by the Standard Contractual Clauses (SCCs) which are hereby incorporated into this DPA by reference. [If needed, we will attach the full text of controller-processor SCCs as an annex.] Where the SCCs apply, {COMPANY_NAME} is the “data importer” and you are the “data exporter.” We will comply with the obligations of the data importer, and you with those of the data exporter. If required, we will also implement additional safeguards to ensure an equivalent level of data protection as required by EU law. If any transfer mechanism is invalidated or insufficient, we will work with you in good faith to adopt an alternative valid solution.
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">5. Liability</h2>
                <p className="mb-4">
                    The liability of each party under this DPA shall be subject to the exclusions and limitations of liability in the main <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link> or Agreement. You (Controller) shall indemnify and hold us harmless for any fines or legal liabilities arising from your failure to comply with your obligations under data protection laws.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">6. Duration and Termination</h2>
                <p className="mb-4">
                    This DPA becomes effective upon your acceptance of the <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link> and remains in effect as long as we process Personal Data on your behalf. Termination of the main Agreement will trigger termination of this DPA. Sections relating to data protection that by their nature should survive (confidentiality, return/deletion, etc.) shall survive.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">7. Miscellaneous</h2>
                <p className="mb-4">
                    In case of any conflict between the main Terms and this DPA regarding data protection, this DPA prevails. If any provision of this DPA is invalid under applicable law, it shall be deemed modified to the minimum extent necessary to make it valid, or if cannot be, then severed, without affecting the remainder. This DPA is governed by the same law and jurisdiction as the main Agreement unless required otherwise by applicable Data Protection Law.
                </p>
                <p className="mb-4">
                    By using the Service in a manner that involves providing personal data for processing, you are deemed to have signed and accepted this DPA as of the effective date of the Agreement. If you need a signed copy, please contact us.
                </p>
            </section>

            <p className="text-sm text-gray-500">Last Updated: {LAST_UPDATED_DATE}</p>
        </div>
    );
};

export default DpaPage;