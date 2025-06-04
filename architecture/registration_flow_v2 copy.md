```mermaid
graph TD
    A[Start Registration] --> B{Registration Modal Opens};

    subgraph Single Registration Modal
        direction LR
        B --> C(Stage 1: Identity & Credentials);
        C --> D{Face Capture};
        D -- Camera Scan --> E[Capture Face Image];
        D -- File Upload --> F[Upload Selfie];
        E --> G{Async Operations};
        F --> G;
        G -- Index Face via AWS Rekognition --> H(Rekognition Indexing);
        G -- Store tmpFaceUrl --> I(tmpFaceUrl Saved);
        C -- Email/Password --> J(Credentials Entered);

        J --> K(Proceed to Plan);
        H --> K;
        I --> K;

        K --> L(Stage 2: Plan & Payment);
        L -- Select Plan --> M[Plan Selected];
        L -- Enter Card Details --> N[Card Details Entered];
        M --> O{Process Payment};
        N --> O;
        O -- Payment Successful --> P(Payment Confirmed);
        O -- Payment Failed --> Q(Handle PaymentError);
        Q --> L;

        P --> R(Stage 3: Profile Finalization);
        R -- Use Face from Stage 1 --> S[Avatar Source Ready];
        S -- Select Style --> T[Style Selected];
        T --> U{Generate Avatar & Nickname};
        U -- Avatar/Nickname Generated --> V[Display Avatar & Nickname];
        V -- Confirm --> W(Finalize Profile);
        U -- Generation Error --> X(Handle Generation Error);
        X --> R;
    end

    W --> Y(Registration Complete);
    A --> Z{User Clicks Register Button};
    Z --> B;

    classDef stage fill:#f9f,stroke:#333,stroke-width:2px;
    classDef asyncOp fill:#ccf,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef importantStep fill:#ff9,stroke:#333,stroke-width:2px;

    class C,L,R stage;
    class H,I asyncOp;
    class D,O,U,W importantStep;
``` 

The architecture dillema: 

Right now we have setup vaiations for facial, avatar stuff:

1. User scans face -> rekognition index face -> we use that face to generate an avatar

2. User scans face -> rekognition index face -> user upload selfie to make avatar from -> validate selfie matches face -> generate avatar

3. User scans face -> upon complete -> index face -> avatar generation

I like the 3rd option because it would require user to scan their face and see the immediate flow, and value system.


```mermaid
-> entry to antropos city










