# Account Deletion Flow

This document outlines the secure account deletion process implemented across multiple systems.

```mermaid
sequenceDiagram
    participant User
    participant ProfileModal
    participant NextAuth
    participant DeleteAccountAPI as API /user/delete-account
    participant DeletionService as AccountDeletionService
    participant NeonDB as Prisma/NeonDB
    participant Firebase as Firebase Auth
    participant Rekognition as AWS Rekognition
    participant ConfirmationPage as Deletion Confirmation Page

    User->>ProfileModal: Clicks "Delete my account"
    ProfileModal->>ProfileModal: Shows deletion confirmation dialog
    User->>ProfileModal: Confirms deletion
    ProfileModal->>DeleteAccountAPI: POST /api/user/delete-account
    
    DeleteAccountAPI->>NextAuth: Verify user session
    NextAuth-->>DeleteAccountAPI: User ID from session
    
    DeleteAccountAPI->>DeletionService: deleteUserAccount(userId)
    
    DeletionService->>NeonDB: Find user profile
    NeonDB-->>DeletionService: Profile data (email, rekFaceId, etc.)
    
    DeletionService->>NeonDB: Update profile<br/>(status=DELETED, anonymize data)
    
    alt Has Face ID
        DeletionService->>Rekognition: Ensure deleted faces collection exists
        DeletionService->>Rekognition: Index face to blacklist collection
        Rekognition-->>DeletionService: Face added to blacklist
    end
    
    DeletionService->>Firebase: Disable user account
    Firebase-->>DeletionService: Account disabled
    
    alt Has Stripe Customer ID
        DeletionService->>NeonDB: Get Stripe customer ID
        Note right of DeletionService: In production:<br/>Cancel subscriptions<br/>Handle payment data
    end
    
    DeletionService-->>DeleteAccountAPI: Deletion successful
    DeleteAccountAPI-->>ProfileModal: Success response
    
    ProfileModal->>Firebase: Sign out user
    ProfileModal->>ConfirmationPage: Redirect to deletion confirmation
    ConfirmationPage->>User: Display deletion confirmation message
    
    Note over User,Rekognition: Face is now blacklisted - user cannot register again with same face
```

## Key Security Features

1. **Soft Deletion with Anonymization**
   - Profiles are marked as DELETED but records are preserved
   - Personal data (email, nickname) is anonymized
   - System integrity and relationships are maintained

2. **Cross-Platform Coordination**
   - Firebase Auth: User account disabled
   - NeonDB: Profile data anonymized and status updated
   - AWS Rekognition: Face added to blacklist collection
   - Stripe: Customer information handled (subscriptions canceled in production)

3. **Face Recognition Blacklisting**
   - Prevents re-registration using the same face
   - Maintains platform integrity and security policies
   - Uses dedicated blacklist collection for efficiency

4. **User Experience**
   - Clear confirmation process
   - Feedback about permanent nature of deletion
   - Explicit notification about face recognition blacklisting
   - Dedicated confirmation page after successful deletion 