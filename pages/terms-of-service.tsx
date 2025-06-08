// pages/terms-of-service.tsx
import React from 'react';
import Link from 'next/link';

// Constants for your company details
const COMPANY_NAME = "Anthropos City";
const COMPANY_EMAIL = "info@anthroposcity.com";
const WEBSITE_URL = "https://www.anthroposcity.com";
const COMPANY_JURISDICTION = "the Republic of Lithuania"; // Example jurisdiction, update as needed
const LAST_UPDATED_DATE = "June 8, 2025"; // Consistent with previous instruction

const TermsOfServicePage: React.FC = () => {
    return (
        <div className="w-full bg-[#111111] px-4 py-8 text-smoke">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    Welcome to our service (“Service”). By accessing or using our globally accessible website and services, you agree to be bound by these Terms of Service (“Terms”). If you do not agree, you must not use the Service. These Terms constitute a legally binding agreement between you (the user) and {COMPANY_NAME} (“Company,” “we,” “us,” or “our”). We may update these Terms from time to time, and will notify users by updating the “Last updated” date. Continued use of the Service after changes means you accept the new Terms.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">2. Eligibility and Minors</h2>
                <p className="mb-4">
                    You must create an account and verify your identity to use certain features. You agree to provide accurate information and not impersonate anyone. Our Service is open to users under 18; however, if you are under the age of majority in your jurisdiction (typically 18), you must have permission from a parent or legal guardian. No users under age 13 may create an account or submit personal data without verifiable parental consent, in compliance with the U.S. Children’s Online Privacy Protection Act (COPPA) (<a href="https://www.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ftc.gov</a>) and similar laws. Where required by applicable law (such as the EU’s GDPR for children under 16), we will obtain parental consent before allowing a minor to use the Service (<a href="https://gdpr-info.eu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">gdpr-info.eu</a>). By using the Service, you represent that you meet these age requirements or have the necessary consent, and that your parent/guardian consents to these Terms on your behalf if you are a minor.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">3. Account Registration and Security</h2>
                <p className="mb-4">
                    When creating an account, you will be asked to provide an email and password. You are responsible for keeping your login credentials confidential and for all activities under your account. <strong>Face Verification:</strong> As part of registration, you must undergo a one-time facial scan via our integrated FaceIO service to verify you are a real individual. You agree to provide a live image of your face for this verification process. We use this scan to confirm your identity and to help prevent multiple accounts or bots. Each user is limited to one account; you may not create multiple accounts or create an account for someone else without authorization. If you suspect unauthorized use of your account, notify us immediately. We reserve the right to suspend or terminate accounts that violate these Terms or for security reasons.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">4. Facial Recognition and AI Avatar Features</h2>
                <h3 className="text-xl font-semibold mb-2">4.1 Consent to Biometric Processing:</h3>
                <p className="mb-4">
                    By using the facial scan feature, you explicitly consent to our collection and processing of your biometric data (your facial images and the unique facial data derived from them) for the purposes of verifying your identity and providing the Service (<a href="https://www.thalesgroup.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">thalesgroup.com</a>). You understand that facial images are considered sensitive personal data under laws like GDPR, and such data will be handled with strict security and privacy measures. We will not use your biometric data to uniquely identify you for any purpose outside the Service, and we will not share it with third parties except as described in our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> or with your consent (<a href="https://ilga.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ilga.gov</a>).
                </p>
                <h3 className="text-xl font-semibold mb-2">4.2 How It Works:</h3>
                <p className="mb-4">
                    We use the FaceIO.net SDK to capture your facial image and perform verification. Your face scan image is temporarily stored (for up to 24 hours) on our secure servers and then deleted. Within that period, the image is converted into a mathematical representation (a biometric hash or feature vector) and processed using AWS Rekognition to create a unique facial ID for you. This numeric face data (which cannot be reverse-engineered into your image (<a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>, <a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>)) is stored securely for ongoing identity verification and anti-fraud purposes. The actual photo of your face is discarded after 24 hours and not retained in identifiable form.
                </p>
                <h3 className="text-xl font-semibold mb-2">4.3 AI-Generated Nickname and Avatar:</h3>
                <p className="mb-4">
                    As part of our Service, we offer a fun feature where we generate a nickname and an avatar based on your facial features. By scanning your face, you agree that we may send the facial image (or the derived data) to OpenAI’s API or a similar AI service to analyze facial attributes and create a suggested nickname and a stylized avatar image for your profile. This process is automated and uses artificial intelligence. For example, our system might detect a friendly expression and generate a nickname like “SmilingTiger” (for illustration purposes). The avatar style will be based on your selected preferences (e.g., cartoon style, gender, etc.) and your facial scan. You retain full ownership of your nickname and avatar image, but you grant us a license to use them within the Service (e.g., to display as your profile and in our community). We strive for the nickname/avatar to be appropriate; however, if you find them offensive or inaccurate, please contact support and you may edit or remove them.
                </p>
                <h3 className="text-xl font-semibold mb-2">4.4 Accuracy and Limitations:</h3>
                <p className="mb-4">
                    You acknowledge that facial recognition and AI are not perfect. We do not guarantee the facial scan will always accurately verify identity (lighting or camera issues can cause failure), nor that the AI-generated nickname or avatar will meet your expectations. These features are provided “as-is” for your enjoyment and security. You agree not to abuse the face scanning system (for example, attempting to scan someone else’s face or using fraudulent images). If you cannot pass the face verification (e.g., if the system cannot recognize you or flags an issue), contact us for assistance – we will provide a manual review process so you are not solely subject to an automated decision without recourse, in accordance with applicable laws.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">5. Subscription and Payment Terms</h2>
                <h3 className="text-xl font-semibold mb-2">5.1 Subscription Service:</h3>
                <p className="mb-4">
                    Our Service is offered on a subscription basis, with recurring periodic fees (e.g., monthly or annually) as selected during sign-up. By subscribing, you authorize us (and our payment processor) to charge the subscription fee to your provided payment method at the start of each billing period until you cancel. All prices are shown in USD/EUR/etc. unless otherwise stated, and include any applicable taxes unless stated.
                </p>
                <h3 className="text-xl font-semibold mb-2">5.2 Payments via Stripe:</h3>
                <p className="mb-4">
                    We use Stripe, Inc. (“Stripe”) and its Stripe Elements for secure payment processing. We do not store your credit card or payment details on our servers. All payment information (such as card number, billing info) is provided directly to Stripe via Stripe’s Elements form and is handled by Stripe in accordance with their security protocols. Stripe is PCI-DSS compliant and will process your payments; by making a purchase, you agree to Stripe’s terms and privacy policy in addition to ours. We receive from Stripe limited information necessary for record-keeping (such as a payment confirmation, your subscription status, and the last four digits of your card or a token). We are not liable for any payment processing errors or security issues arising from Stripe, but we will work to resolve any issues to the best of our ability.
                </p>
                <h3 className="text-xl font-semibold mb-2">5.3 No Refunds:</h3>
                <p className="mb-4">
                    All payments are final and non-refundable. We do not offer refunds or credits for any unused subscription period, partial use of service, or on any basis, except where required by applicable law. Once you have paid for a subscription term, you will have access to the Service for that term. You may cancel your subscription at any time, but your cancellation will apply to the next billing cycle – you will not receive a refund for the current billing period. For example, if you cancel in the middle of a month, you will retain access until the end of the paid month, but will not be charged thereafter. We reserve the right to consider special refund requests in our sole discretion in extenuating circumstances (this does not guarantee a refund). In jurisdictions that mandate refunds (or cooling-off periods) for digital services, we will comply with those laws; however, to the fullest extent permitted, no general refunds will be given.
                </p>
                <h3 className="text-xl font-semibold mb-2">5.4 Failed Payments:</h3>
                <p className="mb-4">
                    If your payment method fails or your account is past due, we may attempt to re-charge the method or notify you to provide a new method. If payment issues persist, we reserve the right to suspend or terminate your access to subscription features. You remain responsible for any unpaid amounts.
                </p>
                <h3 className="text-xl font-semibold mb-2">5.5 Changes in Fees:</h3>
                <p className="mb-4">
                    Subscription fees may change over time. We will notify you at least 30 days in advance of any increase in the fee or material changes to the subscription terms, giving you an opportunity to cancel before such changes take effect. If you continue to use the Service after the new fees become effective, you are deemed to accept the change.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">6. User Conduct and Community Guidelines</h2>
                <p className="mb-4">
                    By using the Service, you agree NOT to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Illegal or Harmful Acts:</strong> Do not use the Service for any unlawful purpose or to promote illegal activities. Do not upload or share content that is offensive, violent, pornographic, harassing, hateful, or otherwise objectionable or that violates any law or right of any person.
                    </li>
                    <li>
                        <strong>Privacy and Data Abuse:</strong> Do not attempt to extract data from our Service that you do not have authorization to access. Do not collect or harvest personal information of other users (such as through scraping or social engineering). Respect the privacy of others.
                    </li>
                    <li>
                        <strong>Impersonation and Misuse of Face Verification:</strong> You must only scan your own face (or that of a child for whom you are a parent/guardian and have the right to consent) for verification. Impersonating someone else or using someone else’s image is strictly prohibited and may be unlawful. Do not attempt to deceive our facial recognition or identity systems.
                    </li>
                    <li>
                        <strong>Account Security:</strong> Do not share your account or transfer it to others. You are responsible for all activity on your account. Do not use another user’s account. Do not attempt to bypass or undermine our security or authentication measures.
                    </li>
                    <li>
                        <strong>Interference and Technical Misuse:</strong> Do not interfere with the normal operation of the Service or any other user’s enjoyment of it. This includes not deploying viruses, bots, worms, or any malicious code on the platform, not flooding or spamming, and not attempting to overload or crash the Service.
                    </li>
                    <li>
                        <strong>Intellectual Property Violations:</strong> Do not upload or share content that infringes any third party’s copyrights, trademarks, or other intellectual property rights. This includes only posting content (like comments or images) that you have the right to share. You also agree not to reverse engineer or misuse our own copyrighted materials, software, or trademarks.
                    </li>
                </ul>
                <p className="mb-4">
                    We reserve the right to monitor content on the Service (including user comments, profiles, and avatars) and to remove or block any content or accounts that, in our sole judgment, violate these guidelines or any law. Violation of these rules may result in suspension or termination of your account and, if appropriate, referral to law enforcement authorities.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">7. User-Generated Content and License</h2>
                <p className="mb-4">
                    Our Service may allow you to create or post content such as profile information, comments, likes, and other materials (collectively, “User Content”). You retain ownership of your User Content. However, by submitting or posting User Content on the Service, you grant us a worldwide, non-exclusive, royalty-free, sublicensable license to use, display, reproduce, distribute, and adapt your User Content within the Service for the purposes of operating, promoting, and improving the Service. For example, we may display your avatar and nickname on your profile or in marketing materials showcasing user avatars (we will ask for additional permission for prominent marketing use outside the platform). This license ends when you delete the User Content or terminate your account, except to the extent your content has been shared with others and they have not deleted it or it was used in any aggregated or anonymized form in our analytics.
                </p>
                <p className="mb-4">
                    <strong>Responsibility for Content:</strong> You are solely responsible for the content you create or post. This means you warrant that you have all necessary rights to post the content and that doing so doesn’t violate anyone else’s rights or any laws. We do not assume any liability for User Content. While we are not obligated to, we reserve the right to review and remove any User Content at our discretion (for example, if it violates our rules or appears to infringe on intellectual property rights).
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">8. Third-Party Links and Affiliate Promotions</h2>
                <p className="mb-4">
                    Our Service may display or provide links, discount codes, or promotions for third-party products or services (“Third-Party Promotions”). For example, we might feature products from partner companies with special discount codes for our users. <strong>Important:</strong> We do not sell these third-party products ourselves, and we are not a party to any transaction you may enter into with a third-party seller. Any purchase or engagement you make with a third party is solely between you and that third party.
                </p>
                <p className="mb-4">
                    <strong>Affiliate Disclosure:</strong> We may have a commercial relationship with some of the third-party providers we promote. This means we might earn a commission or other compensation if you click on an affiliate link or use a provided discount code and then purchase a product. We will endeavor to identify or disclose when links or codes are affiliate in nature. Regardless, our promotions are for your convenience, and inclusion of a third-party link or product does not constitute an endorsement, guarantee, or recommendation by us of that third party or its products/services.
                </p>
                <p className="mb-4">
                    <strong>No Liability for Third Parties:</strong> We do not assume any responsibility or liability for the actions, products, services, or content of any third parties. If you visit or buy from any third-party website, you should read their terms and privacy policies and take any issues (product defects, billing disputes, etc.) up with them. You agree that we won’t be held responsible for any loss or damage of any sort incurred as the result of your dealings with third parties linked on our Service.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">9. Privacy and Data Protection</h2>
                <p className="mb-4">
                    Your privacy is very important to us. Our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> explains what personal data we collect and how we use and protect it. By using the Service, you agree that we can collect and process your information as described in the Privacy Policy. This includes the use of essential cookies and similar technologies as described in our <Link href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link>. We comply with applicable global data protection laws, including the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), to the extent they apply. For details, please review the Privacy Policy section of this document. If you do not agree to our data practices, do not use the Service.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">10. Intellectual Property Rights</h2>
                <p className="mb-4">
                    All content and materials provided by us on the Service (excluding User Content), such as the software, code, design, text, graphics, logos, and trademarks, are owned by or licensed to the Company and are protected by intellectual property laws. You are granted a limited, revocable, non-transferable license to access and use the Service and our content for your personal, non-commercial use only. You may not copy, modify, distribute, sell, or lease any part of our proprietary content or software, nor may you reverse engineer or attempt to extract the source code of our software, unless allowed by law or you have our written permission. Any feedback or suggestions you provide to us regarding the Service may be used by us without any obligation to you.
                </p>
                <p className="mb-4">
                    Your nickname and avatar generated through the Service are based on your inputs and our algorithms. We do not claim ownership of your personal likeness or the AI-generated output that is unique to you. However, note that the underlying software and AI models are our intellectual property or that of our providers (such as OpenAI), and they are protected accordingly.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">11. Disclaimer of Warranties</h2>
                <p className="mb-4">
                    <strong>Use at Your Own Risk:</strong> Our Service is provided on an “AS IS” and “AS AVAILABLE” basis, without warranties of any kind, either express or implied. We make no guarantees that the Service will be uninterrupted, error-free, or secure. We do not guarantee the accuracy of any results or outputs (such as the AI-generated nickname or avatar), or that the face recognition will achieve any specific outcome for identity verification. To the fullest extent permitted by law, we disclaim all warranties, express or implied, regarding the Service and any content or features provided, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, title, and any warranties arising out of course of dealing or usage of trade.
                </p>
                <p className="mb-4">
                    <strong>No Guaranteed Outcomes:</strong> You understand that using our Service (including relying on the nickname/avatar or achieving successful face verification) is at your discretion and risk. We do not warrant that our facial recognition technology will perfectly verify all identities or prevent all fraudulent activities, nor that our AI will produce content that meets your expectations. We provide these innovative features for convenience, personalization, and security, but with no promises of accuracy, fitness for any particular use, or compliance with any standard beyond as explicitly stated.
                </p>
                <p className="mb-4">
                    Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may not apply to you. In such cases, any implied warranties are limited to the minimum scope and duration permitted by applicable law.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">12. Limitation of Liability</h2>
                <p className="mb-4">
                    <strong>No Indirect Damages:</strong> To the maximum extent permitted by law, in no event will the Company or its affiliates, officers, employees, agents, or partners be liable for any indirect, consequential, incidental, special, punitive, or exemplary damages, or any loss of profits or revenues, loss of data, or loss of goodwill, arising out of or in connection with your use of (or inability to use) the Service, or these Terms. This limitation applies regardless of the theory of liability (contract, tort, negligence, strict liability, or otherwise) and even if we have been advised of the possibility of such damages.
                </p>
                <p className="mb-4">
                    <strong>Cap on Liability:</strong> To the fullest extent permitted by law, our total aggregate liability for any claim arising out of or relating to the Service or these Terms shall not exceed the amount you have paid to us for the Service in the last twelve (12) months preceding the claim (or $100 USD if you have not had any paid transactions with us). If applicable law does not allow the limitation of liability as set forth above, our liability will be limited to the maximum extent permitted by law.
                </p>
                <p className="mb-4">
                    <strong>Consumer Rights:</strong> Nothing in these Terms is intended to exclude or limit any condition, warranty, right or liability which may not be lawfully excluded or limited. If you are a consumer in a jurisdiction that confers certain rights (for example, certain statutory warranties or remedies), those rights prevail to the extent they apply by law.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">13. Indemnification</h2>
                <p className="mb-4">
                    You agree to indemnify, defend, and hold harmless the Company and its affiliates, and their respective officers, directors, employees, and agents, from and against any and all losses, liabilities, claims, demands, damages, or expenses (including reasonable attorneys’ fees) arising out of or related to: (a) your use or misuse of the Service; (b) your violation of these Terms or of any law or regulation; (c) your infringement of any intellectual property or other right of any person or entity (such as by posting content you don’t have rights to); or (d) any dispute you have with a third party (including sellers or other users). We reserve the right, at your expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you (in which case you will cooperate with us and provide all information requested by us in defense of such claim). This provision will survive the termination of your account or these Terms.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">14. Suspension and Termination</h2>
                <p className="mb-4">
                    We may suspend or terminate your access to the Service (or certain features) at any time, with or without notice, if you violate these Terms, if necessary for security or legal reasons, or if we discontinue the Service. In the event of termination due to your breach of these Terms, you will not be entitled to any refunds and may be barred from re-registering without our permission. Upon termination, the license granted to you to use the Service will end and we may delete your account and data (as permitted by law and as detailed in the <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>). Sections of these Terms which by their nature should survive termination (such as indemnities, limitations of liability, etc.) shall survive.
                </p>
                <p className="mb-4">
                    If you wish to delete your account, you may do so through your account settings or by contacting support. Account deletion will be processed in accordance with our data retention policies (see <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> for details on data deletion). Keep in mind that removing the app or simply not logging in will not automatically terminate your subscription – you must cancel the subscription to stop recurring charges (see Section 5 on Subscription).
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">15. Governing Law and Dispute Resolution</h2>
                <p className="mb-4">
                    These Terms and any dispute or claim arising out of or in connection with them or the Service shall be governed by and construed in accordance with the laws of {COMPANY_JURISDICTION} (excluding its conflict of law principles). However, if you are a consumer in a jurisdiction with mandatory consumer protection laws, you may also be entitled to the protection of those laws.
                </p>
                <p className="mb-4">
                    <strong>Jurisdiction and Venue:</strong> Any legal suit, action, or proceeding arising out of or related to these Terms or the Service shall be instituted exclusively in the courts of {COMPANY_JURISDICTION}. You and Company both consent to jurisdiction and venue in such courts, and waive any objections to inconvenience of forum. Notwithstanding the foregoing, we reserve the right to seek injunctive relief in any jurisdiction if necessary to prevent irreparable harm (for example, intellectual property infringement).
                </p>
                <p className="mb-4">
                    <strong>Arbitration and Class Action Waiver (if applicable):</strong> At Company’s sole discretion, we may require you to submit any disputes arising from these Terms or use of the Service (including disputes arising from or concerning their interpretation, violation, invalidity, non-performance, or termination) to final and binding arbitration under the Rules of Arbitration of the Lithuanian Court of Arbitration applying Lithuanian law. If arbitration is chosen, you agree to arbitrate on an individual basis. You waive any right to participate in a class action lawsuit or class-wide arbitration. (If you do not agree to this arbitration clause, do not use the Service. If you have already begun use and do not agree, contact us to opt-out within 30 days of first use.)
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">16. Global Compliance and Users</h2>
                <p className="mb-4">
                    Our Service is available globally and we strive to comply with all applicable laws in the regions we operate. Users accessing the Service are responsible for compliance with local laws. You may not use the Service if applicable laws in your country prohibit it. <strong>Export Controls and Sanctions:</strong> You represent that you are not located in a country that is subject to a U.S. government embargo or sanctions, and you are not on any restricted party list. You also undertake not to use the Service for any purpose prohibited by applicable export or sanctions laws.
                </p>
                <p className="mb-4">
                    If you are using the Service from the European Union, United Kingdom, California, or other regions with specific data protection or consumer regulations, additional rights or disclosures may apply as outlined in our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>. We incorporate those requirements into our practices (for example, GDPR rights to data access and deletion, CCPA rights for California consumers, etc.). If there is any conflict between these Terms and mandatory law in your jurisdiction, your local law will prevail only to the extent of the conflict.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">17. Miscellaneous</h2>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Entire Agreement:</strong> These Terms (along with the <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>, <Link href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link>, and any additional guidelines or policies we provide) constitute the entire agreement between you and us regarding the Service, and supersede any prior agreements or understandings (oral or written).
                    </li>
                    <li>
                        <strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable by a court of competent jurisdiction, that provision will be enforced to the maximum extent permissible and the remaining provisions of these Terms will remain in full force and effect.
                    </li>
                    <li>
                        <strong>No Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. Any waiver of any provision must be in writing and signed by an authorized representative of the Company.
                    </li>
                    <li>
                        <strong>Assignment:</strong> You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign our rights and obligations to an affiliate or in connection with a merger, acquisition, sale of assets, or by operation of law.
                    </li>
                    <li>
                        <strong>Headings:</strong> Section headings in these Terms are for convenience only and have no legal or contractual effect.
                    </li>
                    <li>
                        <strong>Contact Information:</strong> If you have any questions, concerns, or feedback about these Terms or the Service, please contact us at <a href={`mailto:${COMPANY_EMAIL}`} className="text-blue-600 hover:underline">{COMPANY_EMAIL}</a>. We will make a good faith effort to address your inquiry promptly.
                    </li>
                </ul>
            </section>

            <p className="text-sm text-gray-500">Last Updated: {LAST_UPDATED_DATE}</p>
        </div>
    );
};

export default TermsOfServicePage;