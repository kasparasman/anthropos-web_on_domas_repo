AuthModal.tsx (Orchestrator - uses useAuthModalState)
    |
    |--- (Conditional Rendering based on flow step)
    |       |--- InitialRegistrationStep.tsx (UI for step 1)
    |       |--- PaymentModal.tsx (Handles payment UI & Stripe Elements)
    |       |--- AvatarNicknameStep.tsx (UI for step 2 - uses useAvatarGeneration)
    |       |--- LoginStep.tsx (UI for login)
    |
    |--- useAuthModalState.ts (Manages flow state, user data across steps)
    |       |--- authService.ts (Calls to /api/auth/*, /api/check-face-duplicate, etc.)
    |       |--- fileUploadService.ts (Direct R2 uploads)
    |       |--- (interacts with useAvatarGeneration hook or avatarService directly)
    |
    |--- useAvatarGeneration.ts (Handles avatar SSE, progress)
            |--- avatarService.ts (Calls to /api/avatar-gen, /api/nickname)

```mermaid
flowchart TD
    A[AuthModal.tsx] --> B[useAuthModalState.ts]
    B --> C[authService.ts]
    B --> D[fileUploadService.ts]
    B --> E[useAvatarGeneration.ts]
    E --> F[avatarService.ts]
    A --> G[Conditional Rendering based on flow step]
    G --> H[InitialRegistrationStep.tsx]
    G --> I[PaymentModal.tsx]
    G --> J[AvatarNicknameStep.tsx]
    G --> K[LoginStep.tsx]
    J --> E
```

