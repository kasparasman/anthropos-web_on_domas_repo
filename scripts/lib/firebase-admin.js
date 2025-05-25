"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFirebaseUser = exports.verifyIdToken = exports.admin = void 0;
// lib/firebase-admin.ts
var firebase_admin_1 = require("firebase-admin");
exports.admin = firebase_admin_1.default;
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
        }),
    });
}
var verifyIdToken = function (token) {
    return firebase_admin_1.default.auth().verifyIdToken(token);
};
exports.verifyIdToken = verifyIdToken;
var deleteFirebaseUser = function (uid) {
    return firebase_admin_1.default.auth().deleteUser(uid);
};
exports.deleteFirebaseUser = deleteFirebaseUser;
