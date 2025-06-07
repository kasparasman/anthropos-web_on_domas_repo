import Head from 'next/head';
import React from 'react';

// Customize these values
const CONFIG = {
    companyName: 'Anthropos City',             // e.g. "Awesome Corp"
    contactEmail: 'info@anthroposcity.com',            // e.g. "support@awesome.com"
    mailingAddress: '',          // e.g. "123 Main St, City, Country"
    lastUpdated: 'June 7, 2025',             // e.g. "June 7, 2025"
    currency: 'USD',             // e.g. 'USD' or 'EUR'
    ageOfMajority: 18,
    coppaMinAge: 13,
    gdprMinAge: 16,
    jurisdiction: '',            // e.g. 'State of X'
    arbitrationOrg: '',          // e.g. 'American Arbitration Association'
};

export default function TermsOfService() {
    const {
        companyName,
        contactEmail,
        mailingAddress,
        lastUpdated,
        currency,
        ageOfMajority,
        coppaMinAge,
        gdprMinAge,
        jurisdiction,
        arbitrationOrg,
    } = CONFIG;

    return (
        <>
            <Head>
                <title>Terms of Service</title>
            </Head>

            <main className="bg-black text-smoke min-h-screen p-8">
                <h1 className="text-3xl font-bold border-b border-smoke pb-2">
                    Terms of Service
                </h1>
                <p className="text-sm text-smoke mt-1">Last updated: {lastUpdated}</p>

                {/* 1. Acceptance of Terms */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
                    <p className="mt-2 leading-relaxed">
                        Welcome to our service ("Service"). By accessing or using our globally accessible website and services,
                        you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you must not use the Service.
                        These Terms constitute a legally binding agreement between you (the user) and {companyName} ("Company," "we," "us," or "our").
                        We may update these Terms from time to time and will notify users by updating the "Last updated" date.
                        Continued use after changes means you accept the new Terms.
                    </p>
                </section>

                {/* 2. Eligibility and Minors */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">2. Eligibility and Minors</h2>
                    <p className="mt-2 leading-relaxed">
                        You must create an account and verify your identity to use certain features. You agree to provide accurate information
                        and not impersonate anyone. Our Service is open to users under 18; however, if you are under {ageOfMajority}, you must
                        have permission from a parent or guardian. No users under age {coppaMinAge} may create an account without parental consent,
                        in compliance with COPPA and similar laws. Where required (e.g., for users under {gdprMinAge} in the EU), we will obtain parental
                        consent. By using the Service, you represent you meet these requirements or have consent.
                    </p>
                </section>

                {/* 3. Account Registration and Security */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">3. Account Registration and Security</h2>
                    <p className="mt-2 leading-relaxed">
                        When creating an account, you provide an email and password. You're responsible for keeping credentials confidential
                        and for all activities under your account. Face Verification: as part of registration, you undergo a one-time facial scan
                        via our integrated FaceIO service to confirm identity and prevent bots. You agree to provide a live image. Each user is
                        limited to one account. If you suspect unauthorized use, notify us immediately. We may suspend or terminate accounts
                        that violate these Terms or for security reasons.
                    </p>
                </section>

                {/* 4. Facial Recognition and AI Avatar Features */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">4. Facial Recognition and AI Avatar Features</h2>
                    <p className="mt-2 leading-relaxed">
                        <strong>4.1 Consent to Biometric Processing:</strong> By using the facial scan, you consent to collection and processing of
                        your biometric data for identity verification. We handle data securely under GDPR and similar laws. We won't use or share
                        biometric data outside the Service except as in our Privacy Policy.
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>4.2 How It Works:</strong> We use FaceIO.net SDK to capture and process your image. The raw image is
                        temporarily stored (up to 24h) and then discarded after converting to a biometric hash via AWS Rekognition.
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>4.3 AI-Generated Nickname and Avatar:</strong> We generate a nickname and avatar via AI (e.g., OpenAI API) based on
                        your facial features. You retain ownership but grant us a license to display within the Service. You can edit or remove
                        offensive results by contacting support.
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>4.4 Accuracy and Limitations:</strong> Facial recognition and AI are provided "as-is." Lighting or camera issues may
                        cause failures. Abuse of the system (e.g., fraudulent images) is prohibited. If verification fails, contact us for manual review.
                    </p>
                </section>

                {/* 5. Subscription and Payment Terms */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">5. Subscription and Payment Terms</h2>
                    <p className="mt-2 leading-relaxed">
                        <strong>5.1 Subscription Service:</strong> Our Service is subscription-based with recurring fees (e.g., monthly or annual).
                        You authorize us to charge your payment method in {currency}. Prices include taxes unless stated.
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>5.2 Payments via Stripe:</strong> We use Stripe Elements for secure processing. We don't store card details;
                        Stripe is PCI-DSS compliant. You agree to Stripe's terms when making payments.
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>5.3 No Refunds:</strong> All payments are final and non-refundable, except where required by law. Cancellations
                        apply to the next billing cycle; you retain access until period end.
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>5.4 Failed Payments:</strong> If payment fails, we may retry or suspend your access until resolved.
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>5.5 Changes in Fees:</strong> We'll notify you 30 days before fee increases. Continued use implies acceptance.
                    </p>
                </section>

                {/* 6. User Conduct and Community Guidelines */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">6. User Conduct and Community Guidelines</h2>
                    <p className="mt-2 leading-relaxed">
                        Prohibited activities include illegal acts, privacy violations, impersonation, account sharing, technical misuse,
                        and IP infringement. We may monitor and remove content or suspend accounts at our discretion.
                    </p>
                </section>

                {/* 7. User-Generated Content and License */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">7. User-Generated Content and License</h2>
                    <p className="mt-2 leading-relaxed">
                        You retain ownership of your content but grant us a worldwide, royalty-free license to display and adapt it within the Service.
                        You're responsible for ensuring you have rights to any content you post. We may remove content that violates these Terms.
                    </p>
                </section>

                {/* 8. Third-Party Links and Affiliate Promotions */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">8. Third-Party Links and Affiliate Promotions</h2>
                    <p className="mt-2 leading-relaxed">
                        We may link or promote third-party products. We're not liable for transactions you enter with them. Affiliate links may earn us
                        a commission; we'll disclose where applicable.
                    </p>
                </section>

                {/* 9. Privacy and Data Protection */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">9. Privacy and Data Protection</h2>
                    <p className="mt-2 leading-relaxed">
                        Your privacy is important. Our Privacy Policy details how we collect and use data in compliance with GDPR, CCPA, and other laws.
                        By using the Service, you consent to our data practices.
                    </p>
                </section>

                {/* 10. Intellectual Property Rights */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">10. Intellectual Property Rights</h2>
                    <p className="mt-2 leading-relaxed">
                        All content provided by us (excluding your content) is our property or licensed. You're granted a limited license for 
                        personal use only.
                        Feedback or suggestions you provide may be used without obligation to you.
                    </p>
                </section>

                {/* 11. Disclaimer of Warranties */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">11. Disclaimer of Warranties</h2>
                    <p className="mt-2 leading-relaxed">
                        Use at Your Own Risk: Our Service is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, 
                        either express or implied. We make no guarantees that the Service will be uninterrupted, error-free, or secure. We do 
                        not guarantee the accuracy of any results or outputs (such as the AI-generated nickname or avatar), or that the face 
                        recognition will achieve any specific outcome for identity verification. To the fullest extent permitted by law, we 
                        disclaim all warranties, express or implied, regarding the Service and any content or features provided, including but 
                        not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, title, and any 
                        warranties arising out of course of dealing or usage of trade. No Guaranteed Outcomes: You understand that using our Service 
                        (including relying on the nickname/avatar or achieving successful face verification) is at your discretion and risk. We do not 
                        warrant that our facial recognition technology will perfectly verify all identities or prevent all fraudulent activities, 
                        nor that our AI will produce content that meets your expectations. We provide these innovative features for convenience, 
                        personalization, and security, but with no promises of accuracy, fitness for any particular use, or compliance with any 
                        standard beyond as explicitly stated. Some jurisdictions do not allow the exclusion of certain warranties, so some of the 
                        above exclusions may not apply to you. In such cases, any implied warranties are limited to the minimum scope and duration permitted by applicable law.
                    </p>
                </section>

                {/* 12. Limitation of Liability */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">12. Limitation of Liability</h2>
                    <p className="mt-2 leading-relaxed">
                        No Indirect Damages: To the maximum extent permitted by law, in no event will the Company or its affiliates, officers, 
                        employees, agents, or partners be liable for any indirect, consequential, incidental, special, punitive, or exemplary 
                        damages, or any loss of profits or revenues, loss of data, or loss of goodwill, arising out of or in connection with your 
                        use of (or inability to use) the Service, or these Terms. This limitation applies regardless of the theory of liability 
                        (contract, tort, negligence, strict liability, or otherwise) and even if we have been advised of the possibility of such 
                        damages. Cap on Liability: To the fullest extent permitted by law, our total aggregate liability for any claim arising 
                        out of or relating to the Service or these Terms shall not exceed the amount you have paid to us for the Service in the 
                        last twelve (12) months preceding the claim (or $100 USD if you have not had any paid transactions with us). If applicable 
                        law does not allow the limitation of liability as set forth above, our liability will be limited to the maximum extent 
                        permitted by law. Consumer Rights: Nothing in these Terms is intended to exclude or limit any condition, warranty, right 
                        or liability which may not be lawfully excluded or limited. If you are a consumer in a jurisdiction that confers certain 
                        rights (for example, certain statutory warranties or remedies), those rights prevail to the extent they apply by law.
                    </p>
                </section>

                {/* 13. Indemnification */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">13. Indemnification</h2>
                    <p className="mt-2 leading-relaxed">
                        You agree to indemnify, defend, and hold harmless the Company and its affiliates, and their respective officers, directors, 
                        employees, and agents, from and against any and all losses, liabilities, claims, demands, damages, or expenses (including reasonable attorneys' fees) 
                        arising out of or related to: (a) your use or misuse of the Service; (b) your violation of these Terms or of any law or regulation; (c) your infringement
                         of any intellectual property or other right of any person or entity (such as by posting content you don't have rights to); or (d) any dispute you have
                          with a third party (including sellers or other users). We reserve the right, at your expense, to assume the exclusive defense and control of any matter
                           otherwise subject to indemnification by you (in which case you will cooperate with us and provide all information requested by us in defense of such 
                           claim). This provision will survive the termination of your account or these Terms.
                    </p>
                </section>

                {/* 14. Suspension and Termination */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">14. Suspension and Termination</h2>
                    <p className="mt-2 leading-relaxed">
                        We may suspend or terminate your access to the Service (or certain features) at any time, with or without notice, if you violate these 
                        Terms, if necessary for security or legal reasons, or if we discontinue the Service. In the event of termination due to your breach of 
                        these Terms, you will not be entitled to any refunds and may be barred from re-registering without our permission. Upon termination, 
                        the license granted to you to use the Service will end and we may delete your account and data (as permitted by law and as detailed 
                        in the Privacy Policy). Sections of these Terms which by their nature should survive termination (such as indemnities, limitations of 
                        liability, etc.) shall survive. If you wish to delete your account, you may do so through your account settings or by contacting support. 
                        Account deletion will be processed in accordance with our data retention policies (see Privacy Policy for details on data deletion). Keep 
                        in mind that removing the app or simply not logging in will not automatically terminate your subscription – you must cancel the subscription to 
                        stop recurring charges (see Section 5 on Subscription).
                    </p>
                </section>

                {/* 15. Governing Law and Dispute Resolution */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">15. Governing Law and Dispute Resolution</h2>
                    <p className="mt-2 leading-relaxed">
                        These Terms and any dispute or claim arising out of or in connection with them or the Service shall be governed by and construed in accordance 
                        with the laws of {jurisdiction} (excluding its conflict of law principles). However, if you are a consumer in a jurisdiction with mandatory 
                        consumer protection laws, you may also be entitled to the protection of those laws. Jurisdiction and Venue: Any legal suit, action, or proceeding 
                        arising out of or related to these Terms or the Service shall be instituted exclusively in the courts of {jurisdiction}. You and Company both 
                        consent to jurisdiction and venue in such courts, and waive any objections to inconvenience of forum. Notwithstanding the foregoing, we reserve 
                        the right to seek injunctive relief in any jurisdiction if necessary to prevent irreparable harm (for example, intellectual property infringement). 
                        Arbitration and Class Action Waiver (if applicable): [Optional clause if the company chooses arbitration] At Company's sole discretion, we may require 
                        you to submit any disputes arising from these Terms or use of the Service (including disputes arising from or concerning their interpretation, violation, 
                        invalidity, non-performance, or termination) to final and binding arbitration under the Rules of Arbitration of {arbitrationOrg} applying {jurisdiction} law. 
                        If arbitration is chosen, you agree to arbitrate on an individual basis. You waive any right to participate in a class action lawsuit or 
                        class-wide arbitration. (If you do not agree to this arbitration clause, do not use the Service. If you have already begun use and do not 
                        agree, contact us to opt-out within 30 days of first use.)
                    </p>
                </section>

                {/* 16. Global Compliance and Users */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">16. Global Compliance and Users</h2>
                    <p className="mt-2 leading-relaxed">
                        Our Service is available globally and we strive to comply with all applicable laws in the regions we operate. Users accessing the 
                        Service are responsible for compliance with local laws. You may not use the Service if applicable laws in your country prohibit it.
                         Export Controls and Sanctions: You represent that you are not located in a country that is subject to a U.S. government embargo or
                          sanctions, and you are not on any restricted party list. You also undertake not to use the Service for any purpose prohibited by 
                          applicable export or sanctions laws. If you are using the Service from the European Union, United Kingdom, California, or other 
                          regions with specific data protection or consumer regulations, additional rights or disclosures may apply as outlined in our Privacy
                           Policy. We incorporate those requirements into our practices (for example, GDPR rights to data access and deletion, CCPA rights 
                           for California consumers, etc.). If there is any conflict between these Terms and mandatory law in your jurisdiction, your local 
                           law will prevail only to the extent of the conflict.
                    </p>
                </section>

                {/* 17. Miscellaneous */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">17. Miscellaneous</h2>
                    <p className="mt-2 leading-relaxed">
                        Entire Agreement: These Terms (along with the Privacy Policy, Cookie Policy, and any additional guidelines or policies we provide) 
                        constitute the entire agreement between you and us regarding the Service, and supersede any prior agreements or understandings 
                        (oral or written). Severability: If any provision of these Terms is held to be invalid or unenforceable by a court of competent 
                        jurisdiction, that provision will be enforced to the maximum extent permissible and the remaining provisions of these Terms will 
                        remain in full force and effect. No Waiver: Our failure to enforce any right or provision of these Terms will not be considered a 
                        waiver of those rights. Any waiver of any provision must be in writing and signed by an authorized representative of the Company. 
                        Assignment: You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may 
                        assign our rights and obligations to an affiliate or in connection with a merger, acquisition, sale of assets, or by operation of 
                        law. Headings: Section headings in these Terms are for convenience only and have no legal or contractual effect. Contact Information: 
                        If you have any questions, concerns, or feedback about these Terms or the Service, please contact us at {contactEmail} or {mailingAddress}. 
                        We will make a good faith effort to address your inquiry promptly.
                    </p>
                </section>
            </main>
        </>
    );
}