This document is for production ship evaluation.

First firebase scaling needs evaluation: 
    Token verification happens on every credentials callback. For high-traffic paths consider:
    Caching decoded tokens in memory for their TTL (≈1 h) using LRU (tiny lib) or @firebase/util’s built-in jwtDecode for quick signature check + clock drift check.
    Or rely on NextAuth’s JWT session strategy instead of credentials callback per page load.

    Observability:
    - ❌ Observability: no structured metrics/trace IDs. Add @sentry/nextjs or OpenTelemetry for rate-limited error reporting.
    - ❌ E2E tests: currently only unit-level helpers. Add Cypress/PW test that signs in with a disposable Firebase user and asserts the full Browser→NextAuth→DB flow.

    Smarts:
        We can add a single config/firebase.ts that derives both client & server configs through Dependency-Injection so future files don’t re-read process.env.

neon DB:
    C. Optional but recommended: Prisma Accelerate (Data Proxy, if above 200 concurrent users)
    ⚠ Startup latency: Prisma’s Rust engine cold-starts in ~200–300 ms. Enabling prisma generate --data-proxy or using the new @neondatabase/serverless driver can shave 100 ms.
    Vercel build step should run prisma migrate deploy, not migrate dev.
    Add NEXT_PUBLIC_SENTRY_DSN + @sentry/nextjs to capture slow queries and lambda errors.

Scaling: 
    Scenario Free-Everything Launch + Vercel Pro Scale + Vercel Pro
    Concurrent signed-in users ≈ 150 ≈ 1 500–2 000 ≈ 4 000–6 000
    Monthly active users (MAU) ≈ 50 k ≈ 250 k ≈ 1 M
    Max new sign-ups / day 10 k 25 k (raise Fire-Auth) 50 k+ (raise)
    
        Beyond that the next moves are:
            switch Prisma to Accelerate or Data Proxy to remove DB connection ceilings,
            shard hot endpoints into Edge Functions or a regional Node server,
            buy Firebase Identity MAU blocks ($0.005 each) — still one of the cheapest auth solutions at scale.

Cloudfare:
    R2 Buckets: Prod/Dev
    Name server: Cloudfare
    Tasks: switch DNS records to Cloudfare
    Cleaning workers:


    Is AWs rekognition production? -No
    Is Cloudfare produciton? -No but I made prod,dev setup, migration left. 
    Ok, so the new dilemma is this:

    anything R2 under custom domain is public so it means it's not fit for user face images, so for that we will create a new bucket prod/dev, then for public as well.:

    storage:
    anthropos-assets-private-dev
    anthropos-assets-private-prod
    Done


Next steps:
-Transition Database to info@anthroposcity.com email. - Done
-Optimize speed of the app. - First step done
-DElete unneeded code - Partially done

What do I do next?

Ensuring small tweaks:  
Email adress verification: firebase
password reset: firebase
email adress change: firebase
import firebasetemplates.md


Added email verification flow - not fully tested yet:

Next thing implement fast firebase development env with emulators.

Learn what is local emulator:




| What it emulates             | Real-world counterpart  | Typical TCP port | What you can do locally                                                 |
| ---------------------------- | ----------------------- | ---------------- | ----------------------------------------------------------------------- |
| **Auth emulator**            | Firebase Authentication | 9099             | Create users, send verification links, set custom claims.               |
| **Firestore emulator**       | Cloud Firestore         | 8080             | Read/write data, enforce security rules, inspect documents in a web UI. |
| **Functions emulator**       | Cloud Functions (1-gen) | 5001             | Hot-reload your TypeScript functions without redeploying.               |
| **Storage emulator**         | Cloud Storage           | 9199             | Upload files, test security rules.                                      |
| **Hosting emulator**         | Firebase Hosting        | 5000             | Serve static assets or proxy to Next.js dev server.                     |
| **Pub/Sub, Analytics, etc.** | Optional add-ons        | various          | Simulate topic pushes, Analytics events, etc.                           |


get the qstach pay as you go it's the best way to go.


the top things to do now: 
Add rollback sequance to the app.
Add centralized logging
Add single page flow





