# Application Architecture


```mermaid
sequenceDiagram
    participant User
    participant Frontend (AuthModal)
    participant BackendAPI
    participant Firebase Auth
    participant NeonDB
    participant Stripe
    participant Rekognition

    User->>Frontend (AuthModal): Fills Email, Password, Face Image
    Frontend (AuthModal)->>BackendAPI: POST /api/auth/provisional-register {email, password, faceImageTmpUrl}
    BackendAPI->>Firebase Auth: Create Firebase User {email, password}
    Firebase Auth-->>BackendAPI: {firebaseUID}
    BackendAPI->>Rekognition: Index Face {faceImageTmpUrl, email}
    Rekognition-->>BackendAPI: {rekognitionFaceId}
    alt Face Unique
        BackendAPI->>NeonDB: Create Profile {firebaseUID, email, rekognitionFaceId, status: PENDING_PAYMENT, tempNickname}
        NeonDB-->>BackendAPI: {profileId}
        BackendAPI->>Stripe: Create Stripe Customer {email, metadata: {profileId: profileId}}
        Stripe-->>BackendAPI: {stripeCustomerId}
        BackendAPI->>NeonDB: Update Profile {profileId, stripeCustomerId: stripeCustomerId}
        BackendAPI-->>Frontend (AuthModal): {status: "PENDING_PAYMENT", email: email} 
        %% No NextAuth session created yet
    else Face Duplicate or Other Error
        BackendAPI->>Firebase Auth: Delete Firebase User {firebaseUID} %% Cleanup
        BackendAPI-->>Frontend (AuthModal): {status: "ERROR", message: "Face duplicate..."}
    end

    Frontend (AuthModal)->>Frontend (AuthModal): Show PaymentModal (passes email for payment)
    User->>Frontend (PaymentModal): Selects Plan, Enters Payment Details
    Frontend (PaymentModal)->>BackendAPI: POST /api/stripe/create-subscription {email, priceId} %% email used to find provisional user & stripeCustomerId
    BackendAPI->>NeonDB: Find Profile by email, get stripeCustomerId
    BackendAPI->>Stripe: Create Stripe Subscription {stripeCustomerId, priceId}
    Stripe-->>BackendAPI: {subscriptionId, clientSecret}
    BackendAPI-->>Frontend (PaymentModal): {clientSecret}
    
    User->>Frontend (PaymentModal): Submits Payment Form
    Frontend (PaymentModal)->>Stripe: stripe.confirmCardPayment(clientSecret, cardDetails)
    Stripe-->>Frontend (PaymentModal): Payment Intent Status (e.g., requires_action, succeeded)
    %% Stripe webhook is the source of truth for backend
    Stripe-->>BackendAPI: WEBHOOK payment_intent.succeeded {paymentIntent}
    BackendAPI->>NeonDB: Find Profile by paymentIntent.metadata.email or stripeCustomerId
    BackendAPI->>NeonDB: Update Profile {status: "ACTIVE_PENDING_PROFILE_SETUP"}
    BackendAPI->>Stripe: (Optional) Update subscription with default payment method
    
    Frontend (PaymentModal)->>Frontend (AuthModal): onPaymentSuccess() callback
    Frontend (AuthModal)->>BackendAPI: POST /api/auth/complete-registration-session {email} %% Or use ID
    %% This endpoint now verifies payment status and creates the NextAuth session
    BackendAPI->>NeonDB: Find Profile by email, verify status is ACTIVE_PENDING_PROFILE_SETUP
    alt Payment Confirmed by Backend
        BackendAPI-->>Frontend (AuthModal): {nextAuthSessionToken} %% Or redirect to trigger NextAuth login
        Frontend (AuthModal)->>Frontend (AuthModal): Store session, User is now logged in
        Frontend (AuthModal)->>Frontend (AuthModal): Show Avatar & Nickname setup UI
    else Payment Not Confirmed by Backend
        Frontend (AuthModal)->>Frontend (AuthModal): Show Error
    end

    User->>Frontend (AuthModal): Sets Avatar & Nickname
    Frontend (AuthModal)->>BackendAPI: POST /api/profile/update-final {avatarUrl, nickname}
    BackendAPI->>NeonDB: Update Profile {avatarUrl, nickname, status: "ACTIVE_COMPLETE"}
    BackendAPI-->>Frontend (AuthModal): {status: "SUCCESS"}
    Frontend (AuthModal)->>User: Show Success, Closes Modal