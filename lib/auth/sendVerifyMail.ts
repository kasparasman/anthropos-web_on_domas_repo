import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase-client";

export async function sendVerifyMail(email: string) {
    const functions = getFunctions(app, 'europe-west1');
    const verify = httpsCallable(functions, "sendVerifyMail");
    await verify({ email });
}
