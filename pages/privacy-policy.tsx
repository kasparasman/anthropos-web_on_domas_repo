// pages/privacy-policy.tsx (or components/PrivacyPolicy.tsx if you prefer to use it as a component)
import React from 'react';
import Link from 'next/link';

// Constants for your company details
const COMPANY_NAME = "Anthropos City";
const COMPANY_EMAIL = "info@anthroposcity.com";
const WEBSITE_URL = "https://www.anthroposcity.com";
const LAST_UPDATED_DATE = "June 8, 2025"; // Consistent with previous instruction

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="w-full bg-[#111111] px-4 py-8 text-smoke">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Introduction</h2>
                <p className="mb-4">
                    Your privacy matters. This Privacy Policy explains what information we collect from users of our Service, how we use and share that information, and your rights regarding your personal data. We are committed to compliance with global privacy laws, including the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), and to protecting your information. Please read this Policy carefully. By using the Service, you acknowledge that you have read and understood this Privacy Policy. If you do not agree, please do not use the Service.
                </p>
                <p className="mb-4">
                    <strong>Data Controller:</strong> {COMPANY_NAME} (referred to as “we” or “us”) is the data controller responsible for the processing of personal data in connection with the Service. If you have any questions about this Policy or our data practices, you can contact us at{' '}
                    <a href={`mailto:${COMPANY_EMAIL}`} className="text-blue-600 hover:underline">{COMPANY_EMAIL}</a> or at the address provided at the end of this Policy.
                </p>
                <p className="mb-4">
                    <strong>Applicability:</strong> This Policy applies to all users worldwide. Additional privacy disclosures for specific jurisdictions (EU/UK, California, children’s privacy, etc.) are included below. We may provide translated versions of this Policy for convenience; in case of any conflict, the English version prevails (unless prohibited by local law).
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Information We Collect</h2>
                <p className="mb-4">
                    We collect personal information that you provide to us directly, information collected automatically about your use of the Service, and information from third parties (like our service providers). We limit our collection to what is relevant for the purposes stated in this Policy (data minimization principle).
                </p>

                <h3 className="text-xl font-semibold mb-2">1. Information You Provide Directly:</h3>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Account Registration Data:</strong> When you create an account, we collect your email address and a password (which is stored in hashed/encrypted form). We also record the date of sign-up and your account settings (such as language or preferences).
                    </li>
                    <li>
                        <strong>Facial Scan and Biometric Data:</strong> If you enroll in our facial verification, we collect a live image or video of your face through your device camera. This facial image data is used to verify you are a real user and to generate your nickname/avatar. We treat this as biometric data, which may be considered sensitive personal information under laws like GDPR and CCPA. Importantly, the raw face image is stored temporarily (for up to 24 hours) on our servers for processing, and then deleted. Before deletion, the image is processed to create a unique numerical representation (a biometric “hash” or facial template) of your facial features (<a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>). This facial template (essentially a set of numbers that cannot be used to reconstruct your face <a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>) is retained and associated with your account for ongoing identity verification and anti-fraud purposes.
                    </li>
                    <li>
                        <strong>Profile Information:</strong> You may provide additional profile details. This includes selecting your gender (for avatar style customization), choosing an avatar style/theme, and receiving an AI-generated nickname and avatar image based on your face. The nickname (a textual moniker) and avatar (an image, often a stylized cartoon version of you) are stored in your profile. You can change your nickname or avatar at any time by contacting support if you find them unsuitable.
                    </li>
                    <li>
                        <strong>Payment Information:</strong> If you subscribe to paid services, we (through Stripe) collect payment details. As noted, we do not see or store full credit card numbers. We do receive from Stripe a payment token or ID, card type and last four digits, expiration, and transaction amounts/status. We also store your subscription plan, status, and history of payments (dates and amounts) for accounting and customer service.
                    </li>
                    <li>
                        <strong>Communications and Support:</strong> If you contact us directly (e.g., via email or support chat), we will receive the content of your communication and any contact info you provide (like email or phone). If we conduct surveys or feedback requests, any responses you provide are collected.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">2. Information We Collect Automatically:</h3>
                <p className="mb-4">
                    When you use the Service, we automatically collect certain technical and usage data:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Usage and Activity Data:</strong> We track actions on the Service such as likes you give/receive, comments you post, profiles you view, and your login times and dates. We also log when you generate or update your avatar, or if you scan your face for login or other features. We may keep logs of such activity to monitor service usage and ensure security.
                    </li>
                    <li>
                        <strong>Device and Log Information:</strong> Our servers automatically record information when you visit or use our Service, known as log data. This may include your IP address, device type, operating system, browser type, referring/exiting pages, and timestamps of access. We also collect device identifiers or mobile IDs if you use a mobile device. This information helps with troubleshooting, analytics, and security (for example, detecting suspicious login attempts).
                    </li>
                    <li>
                        <strong>Cookies and Similar Technologies:</strong> We use cookies and local storage to remember your preferences and settings, authenticate you, and collect information about your interaction with the Service. For instance, we use session cookies to keep you logged in as you navigate pages. We may use analytics cookies to understand how users navigate our site (see our{' '}
                        <Link href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link> for details). We may also use web beacons (pixel tags) in emails to know if you open them, to improve our communications. You can control cookies through your browser settings and other tools; see the Cookie Policy section for more.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">3. Information from Third Parties:</h3>
                <p className="mb-4">
                    We may receive information about you from our service providers and integration partners:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Face Verification Provider (FaceIO/AWS Rekognition):</strong> Our facial recognition is powered by FaceIO and AWS Rekognition. FaceIO provides us with a unique facial ID or template after you complete the face scan. This unique identifier is essentially a code representing your facial features. FaceIO/AWS does not give us your raw image (beyond what we collected) but confirms liveness and provides the biometric hash. According to FaceIO, the facial vectors are stored as meaningless floating-point numbers that cannot reconstruct your image (<a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>, <a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>). We incorporate that data into our database to identify you on login and prevent duplicate accounts.
                    </li>
                    <li>
                        <strong>OpenAI (Nickname/Avatar Generation):</strong> We send your facial image (or an abstracted description of it) to OpenAI’s API to generate your nickname suggestion and avatar. OpenAI may return to us descriptive features (like “smiling, wearing glasses”) to help generate a text nickname, and the actual nickname text and avatar image. We do not receive any additional personal data from OpenAI beyond the outputs related to your submission. OpenAI does not use the data we send for its own purposes – as of 2023, OpenAI’s policy is not to use API data to train models, and it retains API data only for a short period to monitor for abuse (<a href="https://community.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">community.openai.com</a>).
                    </li>
                    <li>
                        <strong>Payment Processor (Stripe):</strong> Stripe provides us with information confirming your payments. For example, we get a confirmation when you subscribe or a notice of payment failure. We might also receive your billing country or zip code from Stripe, which helps us apply the correct taxes and detect fraud (e.g., mismatched locations).
                    </li>
                    <li>
                        <strong>Affiliate / Third-Party Links:</strong> If you click on a third-party product link or use a discount code on our site, we might be informed by the third party for tracking purposes. For instance, a partner might tell us that a user with a certain code made a purchase, so we can calculate commissions. Typically, this data would not include your personal details – it would be aggregate or order-level info. However, if a promotion requires verifying you as our user, we might confirm certain info with the third party with your consent (e.g., to validate eligibility). We do not receive your full purchase details from third parties, only what’s needed for our program (such as confirmation that a code was used successfully).
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">4. Special Categories of Data:</h3>
                <p className="mb-4">
                    As noted, some of the data we handle is considered sensitive:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Biometric Data:</strong> Your facial scan and facial template are biometric identifiers. We obtain your explicit consent for this at the time of collection (see “Legal Bases” below) (<a href="https://www.thalesgroup.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">thalesgroup.com</a>). We use it solely for identity verification, security, and generating your personal features (nickname/avatar). We do not use biometric data for any unrelated purposes, nor do we share, sell, or disclose it except as needed to our processors as described (<a href="https://ilga.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ilga.gov</a>). We also adhere to retention and destruction policies for this data (see Data Retention section).
                    </li>
                    <li>
                        <strong>Children’s Data:</strong> We do not knowingly collect personal data from children under 13 without parental consent. If a user indicates they are under the required age, we will either not allow registration or will seek parent/guardian consent as required by law (e.g., COPPA in the U.S., or GDPR Article 8 for children under 16 in the EU) (<a href="https://gdpr-info.eu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">gdpr-info.eu</a>). If we learn that we collected personal data from a child under 13 (or applicable age) without consent, we will delete that data. See “Children’s Privacy” section below for more.
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">How We Use Your Information</h2>
                <p className="mb-4">
                    We use personal information for the following purposes, and we ensure we have a valid legal basis for each use:
                </p>

                <h3 className="text-xl font-semibold mb-2">1. To Provide and Maintain the Service (Performance of a Contract):</h3>
                <p className="mb-4">
                    We process data that is necessary to create your account and provide the features you request:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        Using your email and password to create and secure your account, let you log in, and communicate important account info.
                    </li>
                    <li>
                        Performing the facial verification process to verify your identity and allow you to use features limited to real users (this helps maintain a community of real individuals and is part of the service contract for creating an account).
                    </li>
                    <li>
                        Generating your nickname and avatar as part of your user profile experience.
                    </li>
                    <li>
                        Enabling you to engage in community features like posting comments, liking other profiles, and interacting. For example, we use your profile data to display your avatar and nickname when you comment.
                    </li>
                    <li>
                        Processing payments for subscriptions, providing you the paid features, and managing billing (through Stripe). We use payment info to know if you have paid and to give you access accordingly.
                    </li>
                    <li>
                        Providing customer support and responding to inquiries. If you reach out for help, we will use your info to assist you.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">2. To Ensure Security and Prevent Fraud (Legitimate Interests / Legal Obligations):</h3>
                <p className="mb-4">
                    We are dedicated to keeping our Service secure:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        We use facial verification and biometric templates to ensure each person only creates one account and to prevent bots or fraudsters. This is crucial to protect our Service’s integrity and the user community. Biometric processing for security and fraud prevention is generally in our legitimate interest and, for sensitive data, done with your consent.
                    </li>
                    <li>
                        We monitor login activity (IP addresses, device info, timestamps) to detect unusual patterns that might indicate unauthorized access. This helps us protect accounts.
                    </li>
                    <li>
                        We may use cookies or device identifiers to implement security features (e.g., remembering a trusted device or requiring re-verification on a new device).
                    </li>
                    <li>
                        If we detect policy violations or potential illegal acts (like someone attempting to use a stolen credit card or harass others), we will use relevant data to investigate and prevent harm. We may also use and share data as required by law enforcement or to comply with legal obligations (see “Disclosures” below).
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">3. To Personalize and Improve the User Experience (Legitimate Interests/Consent):</h3>
                <p className="mb-4">
                    We want to make our Service enjoyable and relevant:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        The nickname and avatar generation is a personalization feature – we use your data (with consent) to create a fun, personal result. We may also tailor the content you see (e.g., suggesting profiles or content) based on your activity.
                    </li>
                    <li>
                        We may analyze how you and others use the Service (via analytics) to improve the interface, fix usability issues, and develop new features. This includes reviewing aggregated data on things like which avatar styles are most popular or how users navigate the app.
                    </li>
                    <li>
                        If you opt in, we might send you personalized communications, such as recommendations or newsletters. For example, if we introduce new avatar styles or partner promotions that might interest you, we could inform you via email – but we will do so only in accordance with direct marketing laws and with appropriate opt-out mechanisms.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">4. To Communicate with You:</h3>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Service and Account Communications:</strong> We will send you administrative or transactional communications as needed (for example, a welcome email, verification codes, password reset emails, billing receipts, subscription renewal notices, or important updates about service availability or security). These are necessary to perform our contract with you and you cannot opt out of receiving critical account-related emails.
                    </li>
                    <li>
                        <strong>Promotional Communications:</strong> If you provide your email for marketing or if it’s lawful in your jurisdiction, we may send newsletters, offers, or surveys to you. For example, we might email you tips on using your avatar, or promotions from us or our partners. We will either obtain your opt-in consent where required (e.g., EU) or give you a clear opportunity to unsubscribe (opt-out) in such emails. We will honor do-not-contact requests promptly.
                    </li>
                    <li>
                        <strong>In-App Notifications:</strong> We may show you notifications in the app for things like new features, or community announcements. You can typically control these via app settings.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">5. To Comply with Legal Requirements:</h3>
                <p className="mb-4">
                    There are situations where we must process personal data to comply with laws or regulations. For instance:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>Keeping transaction records for tax and accounting purposes.</li>
                    <li>Responding to valid legal requests like subpoenas or court orders requiring us to disclose information.</li>
                    <li>Storing certain data if required by law (for example, some jurisdictions require retaining login records for a short period).</li>
                    <li>If you exercise data rights (like requesting deletion or disclosure), we will process your request data to fulfill those obligations.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">6. With Your Consent (when required):</h3>
                <p className="mb-4">
                    In certain cases, we rely on your consent to process your personal information. For example:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        Using your biometric data (face scan) – we explicitly ask for your consent before you undergo the face verification, as this is required under many laws for processing biometric identifiers (<a href="https://www.thalesgroup.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">thalesgroup.com</a>).
                    </li>
                    <li>
                        Using cookies that are not strictly necessary (like analytics or advertising cookies) – we will obtain consent via a cookie banner in jurisdictions that require it.
                    </li>
                    <li>
                        Sending marketing emails in jurisdictions that require opt-in consent.
                    </li>
                    <li>
                        Processing data about minors where parental consent is needed – we will seek that consent.
                    </li>
                </ul>
                <p className="mb-4">
                    Where we rely on consent, you have the right to withdraw it at any time (e.g., you can disable face login and request deletion of your facial data, or unsubscribe from marketing emails). Withdrawal of consent will not affect the lawfulness of processing before the withdrawal.
                </p>
                <p className="mb-4">
                    <strong>Automated Decision-Making:</strong> Other than the automated processes described (face match, AI generation of nickname/avatar), we generally do not make legally significant decisions about you solely by automated means. The facial verification result could potentially restrict your ability to create an account (if, for example, the system flags an attempt as not a live human or a duplicate). This is an automated decision necessary for our service security. If you believe an automated decision is in error, you can contact us to contest or seek human review. We will not subject you to automated decisions that produce legal or similarly significant effects without your explicit consent or as allowed by law.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">How We Share Your Information</h2>
                <p className="mb-4">
                    We do not sell your personal information to data brokers or marketers for money (<a href="https://grassrootscarbon.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">grassrootscarbon.com</a>). We also do not share your information for third-party advertising purposes. However, we do need to share some information with third parties in the following circumstances, to run our Service:
                </p>

                <h3 className="text-xl font-semibold mb-2">1. Service Providers (Processors):</h3>
                <p className="mb-4">
                    We use trusted third-party companies to perform certain processing on our behalf, under our instructions:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>FaceIO / AWS Rekognition:</strong> for facial recognition and storage of biometric templates. They act as our data processors for biometric data. FaceIO/AWS only use the data to provide verification services to us and are bound by strict privacy and security terms. According to FaceIO, the biometric data (facial hash) is stored securely in a sandboxed index, and never used for any purpose except authentication, with deletion available on request (<a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>, <a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>). We have a Data Processing Agreement in place with FaceIO/AWS to ensure GDPR compliance and protection of biometric data.
                    </li>
                    <li>
                        <strong>OpenAI:</strong> to generate nicknames and avatars from facial data. OpenAI acts as a processor when we send the image and returns results. They have committed not to use API-supplied data to train models without consent (<a href="https://community.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">community.openai.com</a>), and they retain it only transiently (up to 30 days) for abuse monitoring (<a href="https://community.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">community.openai.com</a>). We have contractual terms (including data processing addenda) in place with OpenAI to safeguard any personal data.
                    </li>
                    <li>
                        <strong>Stripe:</strong> for payment processing. Stripe is a PCI-compliant payment processor who will process your payments. Stripe may act as an independent data controller for some data (like your credit card info) since they have their own legal obligations for payments. However, they only use your data to process transactions, and we’ve ensured via our agreement that they will not use your personal data for other purposes. Stripe may also set cookies on our site for fraud prevention.
                    </li>
                    <li>
                        <strong>Cloud Hosting (e.g., AWS for general data):</strong> We host our application and database on reputable cloud servers (e.g., AWS). Thus, your data (email, profile, hashed password, etc.) is stored on their infrastructure. AWS acts as a processor, storing and processing data per our instructions. AWS has robust security certifications and offers GDPR-compliant terms (including Standard Contractual Clauses for international transfer) (<a href="https://docs.aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">docs.aws.amazon.com</a>). Our databases are secured and encrypted on these servers.
                    </li>
                    <li>
                        <strong>Email/Communication Tools:</strong> We might use a third-party service to send out emails (like SendGrid or Mailchimp) or to provide customer support chat. These providers would handle your email address and communication content on our behalf for the purpose of sending messages or support. They are not allowed to use your info for anything else.
                    </li>
                    <li>
                        <strong>Analytics Providers:</strong> If we use analytics services (like Google Analytics or similar), these services may set their own cookies or receive certain information (like your IP and activity data) to provide us aggregated insights. We will mention any such providers in our Cookie Policy. We configure such services to anonymize data where possible (for example, IP anonymization in Google Analytics), and we don’t allow them to use or share the data for their own purposes. In some cases, analytics providers may act as independent controllers (e.g., Google using data for improving their services); we will obtain consent where required for such use.
                    </li>
                </ul>
                <p className="mb-4">
                    We ensure that each service provider is bound by appropriate Data Processing Agreements and confidentiality obligations to only process personal data for the purposes we specify, and to protect it to GDPR standards. Where these providers are outside your country (e.g., outside the EU), we implement lawful transfer mechanisms (see “International Data Transfers” below).
                </p>

                <h3 className="text-xl font-semibold mb-2">2. Affiliates and Business Transfers:</h3>
                <p className="mb-4">
                    If our company has affiliates or subsidiaries that require access to data to assist in providing the Service (for example, a branch office in another country handling customer support), we may share data with them. All such entities are under common ownership/control and will comply with this Policy. In the event of a business transfer such as a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction. We will ensure the new owner continues to honor this Privacy Policy or provides notice of any changes. If such a change in ownership occurs, we will notify you (e.g., via email or prominent notice on the site) and inform you of any choices you may have regarding your data.
                </p>

                <h3 className="text-xl font-semibold mb-2">3. Legal Compliance and Protection:</h3>
                <p className="mb-4">
                    We may disclose your information if required to do so by law or if such action is necessary to:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>Comply with legal obligations or valid legal process (e.g., subpoenas, warrants, court orders).</li>
                    <li>Respond to requests from public and government authorities (including to meet national security or law enforcement requirements).</li>
                    <li>Enforce our <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link> or other agreements, including investigation of potential violations.</li>
                    <li>Protect our rights, property, or safety, or that of our users or the public. For example, we might share information with law enforcement or relevant parties if you engage in fraudulent or illegal behavior such as identity theft, or if there’s an immediate risk of harm to someone.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">4. With Your Consent:</h3>
                <p className="mb-4">
                    Apart from the scenarios above, we will request your explicit consent before sharing your personal data with third parties for purposes not covered by this Policy. For instance, if we ever wanted to feature you in a testimonial or share your info with a partner for their direct marketing, we would ask for your permission first (you are absolutely free to decline).
                </p>

                <h3 className="text-xl font-semibold mb-2">5. De-identified or Aggregated Data:</h3>
                <p className="mb-4">
                    We may also share information that has been anonymized or aggregated, so you are not identifiable. For example, we might publish usage statistics (like “X% of our users generated avatars with Style Y”) or share generalized insights with partners. This information does not contain personal data and may be shared without further notice.
                </p>
                <p className="mb-4">
                    We do not sell personal information for monetary consideration, and we do not “share” it for cross-context behavioral advertising as defined under CCPA. In other words, we don’t exchange your personal data with third parties to serve you ads based on your Browse across different services. Therefore, no “Do Not Sell or Share” opt-out is required, as we do not engage in such activities (<a href="https://anyroad.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">anyroad.com</a>, <a href="https://schonbek.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">schonbek.com</a>).
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Cookies and Tracking Technologies</h2>
                <p className="mb-4">
                    For detailed information on how we use cookies and similar technologies, please see our{' '}
                    <Link href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link>. In summary, we use these technologies to provide and optimize our Service (such as keeping you logged in, remembering preferences), to analyze usage (so we can improve), and to facilitate any affiliate tracking (ensuring a partner knows that you came from us, if applicable).
                </p>
                <p className="mb-4">
                    We do not currently use cookies for advertising networks or tracking your behavior across unrelated sites. If that changes, we will update our Cookie Policy and obtain necessary consents.
                </p>
                <p className="mb-4">
                    You have control over cookies – you can adjust your browser settings to refuse or delete cookies (note: essential cookies are needed for the Service to function, like maintaining your login session). For non-essential cookies, where required by law, we provide a cookie consent banner when you first visit the site, allowing you to accept or reject certain categories of cookies. You can also change your preferences at any time by accessing our{' '}
                    <Link href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</Link> page.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Data Retention</h2>
                <p className="mb-4">
                    We keep personal data only for as long as necessary to fulfill the purposes for which we collected it, including for any legal, accounting, or reporting requirements. Retention periods vary by data type and user status:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Account Data:</strong> We keep your account information (email, hashed password, profile info) for as long as your account exists. If you delete your account or it’s terminated, we will delete or anonymize this data within a reasonable period after account closure (generally within 30 days), except where we must retain it for legal reasons (e.g., record of a transaction for tax purposes, or information needed for resolving disputes or fraud prevention). Backup copies might persist for a short time, but we have processes to purge deleted account data from active systems.
                    </li>
                    <li>
                        <strong>Biometric Data (Facial Images/Template):</strong> Your actual facial image captured for verification is retained no longer than 24 hours, after which it is permanently deleted from our systems. The derived facial feature data (biometric hash) is retained as long as you have an account, since it is needed to authenticate you or ensure uniqueness (that you’re not registering multiple accounts). If you delete your account or withdraw consent for biometric processing, we will remove your facial template from our active database and instruct our face recognition provider (FaceIO/AWS) to permanently delete your facial ID record (<a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>). Additionally, we have implemented a retention policy compliant with biometric laws like Illinois BIPA, which requires destroying biometric identifiers when the purpose has been satisfied or within 3 years of last use (<a href="https://ilga.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ilga.gov</a>). This means if you stop using your account (no logins) for an extended period (up to 3 years), we will purge your biometric data even if the account remains registered. You may also request deletion sooner, as described in “Your Rights” below.
                    </li>
                    <li>
                        <strong>Avatar and Nickname:</strong> These are stored as part of your profile. If you delete your account, these are deleted. If you change your avatar or nickname, we may not retain old ones except in backup logs. Avatars (images) you download and save are outside our control of course.
                    </li>
                    <li>
                        <strong>Usage Data:</strong> Logs of your logins, likes, and comments are kept while your account is active for operational and historical purposes (for example, showing your comment history). If you delete your account, we typically delete or anonymize logs associated with your user ID within 60 days. Some aggregated or anonymized data (e.g., total number of likes on a post without user identification) may be retained.
                    </li>
                    <li>
                        <strong>Comments/Posts:</strong> Content you have posted (comments on others’ profiles, etc.) may remain visible to others even after you delete your account, unless you delete them prior or as part of account deletion. We recommend removing any content you don’t want visible before deleting your account. We can also disassociate your deleted account’s identifier from old posts (they may show an anonymous or “deleted user” label).
                    </li>
                    <li>
                        <strong>Payment and Transaction Records:</strong> We retain transaction records (subscription payments, invoices) as long as required by law (e.g., for financial record-keeping, typically 7 years in some jurisdictions) or our legitimate business needs. However, this does not include sensitive payment details (card numbers) – those are handled by Stripe.
                    </li>
                    <li>
                        <strong>Emails and Support Communications:</strong> Emails or support tickets may be retained for a period to assist you or for our records. Typically, we keep support correspondence for up to 2 years, unless a longer period is required for legal reasons (for example, if there’s a dispute that may result in legal action).
                    </li>
                    <li>
                        <strong>Legal Holds:</strong> If we are subject to a legal obligation to preserve data (such as a litigation hold or government order), or if an issue like an unresolved dispute, fraud, or security incident requires us to keep information, we will retain the specific data as needed until the issue is resolved or the legal obligation ends.
                    </li>
                </ul>
                <p className="mb-4">
                    After the retention period, we will either securely delete or anonymize the personal data. When anonymized, data will no longer be associated with you and may be used for analytical purposes without further notice.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">International Data Transfers</h2>
                <p className="mb-4">
                    Our Service is global, and as such, your information may be transferred to or stored on servers in different countries than your own. Specifically, if you are located outside the United States, be aware that your personal data (including facial data, account info, etc.) may be transferred to and processed in the United States or other jurisdictions where our service providers (AWS, OpenAI, Stripe, etc.) operate. These countries may have data protection laws that are different or less protective than those in your home country.
                </p>
                <p className="mb-4">
                    However, when we transfer personal data internationally, we take steps to ensure it remains protected in line with this Policy and applicable law:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>GDPR (EEA/UK/Switzerland) Transfers:</strong> For users in the European Economic Area, United Kingdom, or Switzerland, whenever we transfer your personal data out of these regions, we will ensure a legal transfer mechanism is in place. This typically involves using the European Commission’s Standard Contractual Clauses (SCCs) (<a href="https://stinson.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stinson.com</a>) with the receiving party, combined with additional safeguards as needed (such as encryption in transit and at rest). For example, our agreements with AWS, OpenAI, and other processors include SCCs to cover transfer of EU personal data to the U.S. or other third countries. We also consider any need for supplementary measures in light of the Schrems II decision. Alternatively, we may rely on an adequacy decision (if the destination country is deemed by the EU to have adequate data protection) or, in some cases, your explicit consent for the transfer (though we try to avoid relying on consent for routine transfers).
                    </li>
                    <li>
                        <strong>Other Regions:</strong> For transfers from other countries with data export requirements (such as Brazil’s LGPD or other privacy laws), we similarly ensure compliance. Often SCCs or analogous contractual clauses are used.
                    </li>
                    <li>
                        <strong>Service Providers’ Certifications:</strong> Some of our U.S. service providers, like Stripe and AWS, participate in recognized frameworks or have robust privacy programs. For instance, prior to its invalidation, they adhered to Privacy Shield; now they rely on SCCs. We verify that our processors commit to GDPR-level protections regardless of where they process data.
                    </li>
                </ul>
                <p className="mb-4">
                    By using our Service or providing us information, you consent to the transfer of your personal data to countries outside of your country of residence, including the United States. We understand this can be a concern, and if you have questions about our transfer mechanisms, please contact us.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Data Security</h2>
                <p className="mb-4">
                    We employ a combination of technical, administrative, and physical security measures to protect your personal information from unauthorized access, loss, misuse, or alteration:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Encryption:</strong> All communications with our website are protected via HTTPS encryption in transit. Sensitive data (such as passwords and biometric hashes) are encrypted at rest in our databases. Biometric data is stored in a hashed form that is not intelligible on its own (<a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>). We also leverage encryption provided by our processors (e.g., Stripe for payment info).
                    </li>
                    <li>
                        <strong>Access Controls:</strong> We restrict access to personal data to authorized personnel who need it to operate, develop, or support our Service. Staff are bound by confidentiality obligations. Administrative access to systems requires authentication and follows the principle of least privilege.
                    </li>
                    <li>
                        <strong>Secure Infrastructure:</strong> We host data with reputable providers (like AWS) that have high security standards and certifications (ISO 27001, SOC 2, etc.). Our servers are protected by firewalls and monitored for potential vulnerabilities or intrusions. We keep software up to date and follow best practices for securing our application (such as regular security audits and penetration testing).
                    </li>
                    <li>
                        <strong>Anonymization/Pseudonymization:</strong> Where possible, we pseudonymize data. For example, your face is stored as a numerical template rather than the raw image, reducing the risk in case of a breach (<a href="https://faceio.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faceio.net</a>). Activity logs may be keyed by user IDs rather than plain names or emails.
                    </li>
                    <li>
                        <strong>Backup and Recovery:</strong> We back up data to prevent accidental loss. Backups are also encrypted. If any incident occurs, we have an incident response plan to address and mitigate harm.
                    </li>
                    <li>
                        <strong>Employee Training:</strong> We train our team about privacy and security, especially those who manage user data. We also have protocols in place if a potential security issue arises.
                    </li>
                </ul>
                <p className="mb-4">
                    Despite our efforts, no system is 100% secure. We cannot guarantee absolute security of your data.
                </p>
            </section>

            {/* Added sections for Children's Privacy and Your Rights as indicated in the text, and a Contact section */}

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Children's Privacy</h2>
                <p className="mb-4">
                    Our Service is not intended for children under the age of 13, and we do not knowingly collect personal data from children under 13 without parental consent. If a user indicates they are under the required age, we will either not allow registration or will seek parent/guardian consent as required by law (e.g., COPPA in the U.S., or GDPR Article 8 for children under 16 in the EU). If we learn that we have collected personal data from a child under 13 (or applicable age) without consent, we will delete that data. We encourage parents and guardians to monitor their children's online activities and to help enforce our Policy by instructing their children never to provide personal data through our Service without their permission. If you have reason to believe that a child under the age of 13 has provided personal data to us, please contact us immediately at <a href={`mailto:${COMPANY_EMAIL}`} className="text-blue-600 hover:underline">{COMPANY_EMAIL}</a>, and we will endeavor to delete that information from our records.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Your Rights</h2>
                <p className="mb-4">
                    Depending on your location and applicable data protection laws (like GDPR, CCPA), you may have certain rights regarding your personal data. These rights are not absolute and may be subject to limitations and exceptions.
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Right to Access:</strong> You have the right to request a copy of the personal data we hold about you.
                    </li>
                    <li>
                        <strong>Right to Rectification:</strong> You have the right to request that we correct any inaccurate or incomplete personal data we hold about you.
                    </li>
                    <li>
                        <strong>Right to Erasure ({"'Right to be Forgotten'"}) :</strong> You have the right to request that we delete your personal data under certain circumstances (e.g., if it is no longer necessary for the purposes for which it was collected, or if you withdraw consent and there is no other legal basis for processing).
                    </li>
                    <li>
                        <strong>Right to Restriction of Processing:</strong> You have the right to request that we restrict the processing of your personal data under certain conditions (e.g., if you contest the accuracy of the data, or if the processing is unlawful).
                    </li>
                    <li>
                        <strong>Right to Data Portability:</strong> You have the right to receive the personal data you have provided to us in a structured, commonly used, and machine-readable format, and to transmit that data to another controller, where technically feasible.
                    </li>
                    <li>
                        <strong>Right to Object:</strong> You have the right to object to the processing of your personal data in certain situations (e.g., for direct marketing purposes, or when processing is based on legitimate interests).
                    </li>
                    <li>
                        <strong>Right to Withdraw Consent:</strong> Where we rely on your consent to process your personal data, you have the right to withdraw that consent at any time. This will not affect the lawfulness of processing based on consent before its withdrawal.
                    </li>
                    <li>
                        <strong>Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with a supervisory authority if you believe our processing of your personal data violates applicable law. For users in the EU/UK, contact your local data protection authority.
                    </li>
                </ul>
                <p className="mb-4">
                    To exercise any of these rights, please contact us using the contact details provided below. We will respond to your request in accordance with applicable law. We may require you to verify your identity before fulfilling your request.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Changes to this Privacy Policy</h2>
                <p className="mb-4">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically for any changes. Your continued use of the Service after any modifications constitutes your acceptance of the updated Privacy Policy.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Contact Us</h2>
                <p className="mb-4">
                    If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        By email: <a href={`mailto:${COMPANY_EMAIL}`} className="text-blue-600 hover:underline">{COMPANY_EMAIL}</a>
                    </li>
                    <li>
                        By visiting our website: <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{WEBSITE_URL}</a>
                    </li>
                    {/* Add a physical address if applicable, e.g., */}
                    {/* <li>
                        By mail: [Your Company Full Address Here]
                    </li> */}
                </ul>
            </section>

            <p className="text-sm text-gray-500">Last Updated: {LAST_UPDATED_DATE}</p>
        </div>
    );
};

export default PrivacyPolicyPage;