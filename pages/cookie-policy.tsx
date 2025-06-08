// components/CookiePolicy.tsx
import React from 'react';
import Link from 'next/link';

const COMPANY_NAME = "Anthropos City"; // Replace with your company name
const COMPANY_EMAIL = "info@anthroposcity.com"; // Replace with your privacy contact email
const WEBSITE_URL = "https://www.anthroposcity.com"; // Replace with your website URL
const LAST_UPDATED_DATE = "June 8, 2025"; // Replace with the actual last updated date of your policy

const CookiePolicy: React.FC = () => {
    return (
        <div className=" w-full bg-[#111111] px-4 py-8 text-smoke"> {/* You might want to adjust styling here */}
            <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Introduction</h2>
                <p className="mb-4">
                    This Cookie Policy explains how we use cookies and similar tracking technologies on our website/service, and your choices regarding them. By using our Service, you consent to our use of cookies as described in this policy, unless you disable them via your browser or our provided opt-out mechanisms. This policy is intended to be read in conjunction with our{' '}
                    <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> and{' '}
                    <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link>.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">What are Cookies and Similar Technologies?</h2>
                <p className="mb-4">
                    Cookies are small text files that are stored on your device (computer, smartphone, etc.) when you visit a website. They allow the website to recognize your device and remember certain information about you, like your preferences or past actions. Cookies can be "session cookies" (which expire when you close your browser) or "persistent cookies" (which remain on your device for a set period or until deleted).
                </p>
                <p className="mb-4">
                    We also use related technologies such as:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li><strong>HTML5 Local Storage:</strong> which can store data in your browser (used for similar purposes as cookies).</li>
                    <li><strong>Web Beacons/Pixels:</strong> tiny images or scripts embedded in emails or on web pages that track if you have opened an email or viewed a page.</li>
                    <li><strong>SDKs (in mobile apps):</strong> which function like cookies for apps, if applicable.</li>
                </ul>
                <p>For simplicity, we refer to all these technologies as "cookies" in this policy.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Why We Use Cookies</h2>
                <p className="mb-4">
                    We use cookies and similar technologies for several reasons:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Essential Functions:</strong> These cookies are necessary for the Service to operate properly. For example, when you log in, we use cookies (or similar tokens) to maintain your session, so you don't have to re-enter your password on every page. They also help with security (e.g., to keep you logged out after a certain time of inactivity or to prevent CSRF attacks).
                    </li>
                    <li>
                        <strong>Preferences:</strong> We use cookies to remember your preferences and settings. For instance, cookies remember if you have seen or closed a notification, your language or region selection, or your avatar style choices.
                    </li>
                    <li>
                        <strong>Analytics and Performance:</strong> We use cookies to collect information about how users interact with our site, which pages are visited, how often, and so on. This helps us improve the Service by understanding usage patterns. For example, we might use Google Analytics or a similar tool that sets cookies to gather usage data (like your IP, device info, time of visit, pages visited). We configure such tools in compliance with privacy laws (e.g., IP anonymization in the EU, and obtaining consent where required).
                    </li>
                    <li>
                        <strong>Functionality:</strong> Some cookies help with additional functionality, such as enabling support chat, or remembering some of your customizations beyond basic preferences.
                    </li>
                    <li>
                        <strong>Advertising and Affiliate Tracking:</strong> Currently, we do not host third-party ads on our site that would use cookies for behavioral targeting. However, we do use cookies for affiliate tracking. If you click a third-party product link or use a discount code we provide, a cookie may be set on your device indicating that you came from our site. This cookie (often set by the third-party or an affiliate network) allows the third-party to recognize our referral (so we can get credit for the referral). For example, if we have an affiliate partnership with an online store, clicking their link might place an affiliate cookie on your browser. These cookies typically contain an ID or code that the third-party can read when you make a purchase, to attribute it to us. The data in these cookies is not personally identifying to you (it doesn't include your name or email, just an anonymous ID).
                        <p className="mt-2">
                            We do not share your personal data in this process; the cookie is the mechanism of tracking. However, if you later provide info to that third-party (to complete a purchase), that info is governed by their privacy policies.
                        </p>
                        <p className="mt-2">
                            We ensure any affiliate programs we participate in are compliant with applicable laws (for instance, if required, we will notify you of the use of such cookies and obtain consent). We also disclose our affiliate relationships in our Terms of Service and possibly near the links (e.g., "affiliate link" labels) to maintain transparency.
                        </p>
                    </li>
                    <li>
                        <strong>Social Media (if applicable):</strong> If we had social media sharing buttons or login integrations (like "Login with Facebook"), those services might set cookies. (Currently, we do not have third-party social logins, but if this changes, we will update our policy.)
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Cookies We Use</h2>
                <p className="mb-4">
                    Below is a list of the categories of cookies in use, with examples (Note: The specific cookies may change over time, and names can differ per browser/device):
                </p>

                <h3 className="text-xl font-semibold mb-2">Essential Cookies:</h3>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>SessionID:</strong> (example name: sessionid or our service name) – Keeps you logged in and identifies your user session on our servers. Without it, you would have to log in on every page.
                    </li>
                    <li>
                        <strong>CSRFToken:</strong> (example name: csrftoken) – A security cookie to prevent cross-site request forgery attacks by confirming actions came from you.
                    </li>
                    <li>
                        <strong>faceio_ Cookies:</strong> FaceIO may use certain cookies/local storage during face enrollment to maintain the flow. For instance, they might store an indicator that you've completed face verification for quicker subsequent logins. These would be strictly to facilitate the authentication process.
                    </li>
                    <li>
                        <strong>Stripe Cookies:</strong> Stripe may set cookies like __stripe_mid and __stripe_sid to prevent fraud and remember devices when processing payments. These cookies help Stripe identify if a device has been seen before in fraudulent activity. They are considered essential for secure payment processing.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">Preferences and Functional Cookies:</h3>
                <ul className="list-disc ml-6 mb-4">
                    <li><strong>Language/Region:</strong> (example: site_lang) – remembers your chosen language.</li>
                    <li><strong>Theme:</strong> (example: dark_mode) – if we have a dark/light mode, stores your choice.</li>
                    <li>
                        <strong>CookieConsent:</strong> (example: cookie_consent) – remembers that you saw our cookie banner and what preferences you set, so we don't show it every time.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">Analytics Cookies:</h3>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Google Analytics (_ga, _gid, etc.):</strong> These cookies, if present, are used to distinguish users and gather information about site usage (page visits, duration, etc.). We have configured Google Analytics to anonymize IP addresses (removing the last octet) to enhance privacy. These cookies might have a lifespan of a few minutes (_gid) to up to 2 years (_ga). The data they collect is aggregated and helps us understand user behavior. We do not use Google Analytics' Advertising features.
                    </li>
                    <li>
                        <strong>In-house Analytics:</strong> If we use our own simple analytics, we might set a cookie to avoid double-counting a user in unique visits.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">Affiliate/Third-Party Cookies:</h3>
                <ul className="list-disc ml-6 mb-4">
                    <li>
                        <strong>Affiliate Network Cookie:</strong> (example: affiliate_ref) – when you click an affiliate link, a cookie from the affiliate network or merchant might be placed to log that referral. It typically contains a partner ID (identifying us) and maybe a campaign ID. For instance, if we partner with Amazon Associates, Amazon might set a cookie to note you came via our link.
                        <p className="mt-2">
                            We ensure these cookies expire within a reasonable time (many affiliate cookies last 7 to 30 days, giving you time to make a purchase).
                        </p>
                        <p className="mt-2">
                            If you prefer not to have affiliate cookies, you can choose not to click such links, or you can clear your cookies after clicking (though that might prevent us from getting credit for the referral).
                        </p>
                    </li>
                </ul>
                <p className="mb-4">
                    Note: We do not use advertising networks that profile you, so you shouldn't see cookies for third-party advertisers (like Google Ads, Facebook Pixel) on our site at this time. If that changes, we will update this policy and request appropriate consent.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Your Choices and Control</h2>
                <h3 className="text-xl font-semibold mb-2">Browser Settings:</h3>
                <p className="mb-4">
                    Most web browsers allow you to control cookies through their settings preferences. You can typically choose to block or delete cookies. However, please note that if you disable cookies entirely, our Service's essential functions may not work properly (for example, you might not be able to log in or maintain a session). Here are links on how to manage cookie settings for popular browsers:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Chrome</a></li>
                    <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firefox</a></li>
                    <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
                    <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-5791-ad5d1764c9ec" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Edge</a></li>
                    <li><a href="https://support.microsoft.com/en-us/topic/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Internet Explorer</a></li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">Cookie Banner & Preferences:</h3>
                <p className="mb-4">
                    When you first visit our site (from certain regions), you will see a cookie consent banner. We will not set non-essential cookies (like analytics or affiliate cookies) until you have made a choice. You can opt in or out of categories of cookies (except those strictly necessary). If you opt out of analytics, for instance, we will not load Google Analytics for you. You can also withdraw consent by clearing cookies in your browser.
                </p>

                <h3 className="text-xl font-semibold mb-2">Do Not Track:</h3>
                <p className="mb-4">
                    Our site does not currently respond to "Do Not Track" signals from browsers, because there is no industry consensus on how to interpret them. However, we treat all users with the same high standard of privacy. We do not serve targeted third-party ads, so we don't use tracking for advertising purposes regardless.
                </p>

                <h3 className="text-xl font-semibold mb-2">Opt-Out of Analytics:</h3>
                <p className="mb-4">
                    If you prefer not to be included in Google Analytics data even when it's anonymized, Google provides a browser add-on to opt-out (the{' '}
                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>). Additionally, if we use any analytics, we will respect the cookie preferences you set (declining analytics cookies means no GA tracking script runs).
                </p>

                <h3 className="text-xl font-semibold mb-2">Clearing Local Storage:</h3>
                <p className="mb-4">
                    In addition to cookies, you can clear local storage data via your browser's developer tools or settings.
                </p>

                <h3 className="text-xl font-semibold mb-2">Impact of Disabling Cookies:</h3>
                <p className="mb-4">
                    If you disable or delete cookies, please be aware that some features of our Service might not function as intended. For example, you might have to log in repeatedly, or certain preferences might not be saved. Essential cookies (if removed) could break site functionality. We recommend allowing essential cookies at minimum.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Changes to this Cookie Policy</h2>
                <p className="mb-4">
                    We may update this Cookie Policy from time to time (for example, if we add new cookies or start using new providers). Significant changes will be communicated via our website (and if required, we will re-prompt for consent). The "Last Updated" date at the bottom indicates when this policy was last revised.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-left">Contact</h2>
                <p className="mb-4">
                    If you have any questions or concerns about our use of cookies and similar technologies, you can contact us at{' '}
                    <a href={`mailto:${COMPANY_EMAIL}`} className="text-blue-600 hover:underline">{COMPANY_EMAIL}</a>. For more information about how we handle your personal data, please see our{' '}
                    <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                </p>
            </section>

            <p className="text-sm text-gray-500">Last Updated: {LAST_UPDATED_DATE}</p>
        </div>
    );
};

export default CookiePolicy;