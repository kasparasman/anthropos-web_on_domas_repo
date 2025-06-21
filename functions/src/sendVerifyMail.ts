import * as functions from "firebase-functions/v2";
import * as admin     from "firebase-admin";
import nodemailer     from "nodemailer";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,          // SSL
  auth: {
    user: "info@anthroposcity.com",
    pass: process.env.GMAIL_APP_PASSWORD,   // store in .env.local & prod secret
  },
});

// -----------------------------------------------------------------------------
// Pre-load the branded HTML template once per cold-start. The file lives next to
// the function bundle at ../../templates/verifyEmail.html
// -----------------------------------------------------------------------------
const rawTemplate = readFileSync(
  resolve(__dirname, "../templates/verifyEmail.html"),
  "utf8",
);

function renderHtml(link: string) {
  // Replace every occurrence of the placeholder with the magic link.
  return rawTemplate.replace(/\$\{link\}/g, link);
}

export const sendVerifyMail = functions.https.onCall(
  { region: "europe-west1" },
  async (request) => {
    const email = request.data.email;
    if (typeof email !== "string") throw new functions.https.HttpsError(
      "invalid-argument", "Email must be provided");

    /* 1 ─ generate magic link */
    const link = await admin.auth().generateEmailVerificationLink(email, {
      url: "https://www.anthroposcity.com/verifyEmail",
      handleCodeInApp: true,
    });

    /* 2 ─ send branded e-mail */
    await transporter.sendMail({
      from: "Anthropos City <info@anthroposcity.com>",
      to  : email,
      subject: "Verify your e-mail",
      html: renderHtml(link),
      text: `Hello!\nPlease verify your e-mail by clicking:\n${link}`,
      headers: {
        "List-Unsubscribe":
          "<mailto:unsubscribe@anthroposcity.com>",
      },
    });

    return { ok: true };
  }
);
