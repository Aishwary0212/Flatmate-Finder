# System Design Write-up

NestMatch follows a three-tier architecture consisting of a React (Vite) frontend, a Node.js/Express backend, and MongoDB as the primary database. The frontend communicates with the backend through REST APIs using Axios with JWT-based authentication, while real-time communication is handled through Socket.IO. Cloudinary is used for image storage, and email notifications are sent using Nodemailer.

### Compatibility Scoring Design

The compatibility scoring module helps tenants identify listings that best match their preferences while assisting owners in prioritizing suitable applicants. Whenever a tenant views or expresses interest in a listing, the backend compares the tenant profile with the listing attributes.

The score is calculated using weighted parameters:

* **Budget Match (40%)** – Compares the tenant's maximum budget with the listing rent.
* **Location Match (30%)** – Evaluates whether the preferred location matches the listing location.
* **Room Preference (20%)** – Checks whether the desired room type matches the available accommodation.
* **Amenities Match (10%)** – Compares preferred amenities such as Wi-Fi, parking, furnished rooms, or pet-friendly options.

Each component contributes to a normalized score between 0 and 100. The computed score, along with a short explanation, is stored in the CompatibilityScore collection to avoid repeated calculations. Listings can then be ranked by compatibility, providing personalized recommendations to tenants.

### LLM Integration and Fallback

NestMatch integrates a Large Language Model (LLM) to generate human-readable explanations for compatibility scores and provide personalized recommendations. Instead of displaying only a numerical percentage, the LLM summarizes why a listing is suitable by highlighting matching preferences, possible concerns, and improvement suggestions.

The workflow is as follows:

1. The backend calculates the compatibility score.
2. The tenant profile and listing details are sent to the LLM service.
3. The LLM generates a concise explanation and recommendation.
4. The explanation is returned to the frontend along with the score.

To improve reliability, a fallback mechanism is implemented. If the LLM is unavailable, exceeds response time, or returns an error, the backend generates rule-based explanations using predefined templates such as:

*"Excellent budget match with your preferred location. The room type aligns with your preferences, but some preferred amenities are unavailable."*

This ensures that the application remains fully functional even when AI services are temporarily unavailable.

### Chat Implementation

Messaging is available only after a property owner accepts a tenant's interest request. This restriction prevents spam and ensures conversations occur only between mutually interested users.

Socket.IO provides real-time communication. When a user sends a message:

1. The frontend emits a `message:send` event.
2. The backend validates the sender and stores the message in MongoDB.
3. The server emits a `message:received` event to the recipient.
4. Both users immediately see the updated conversation without refreshing the page.

To maintain reliability, every message is permanently stored in the database. If either user reconnects later, previous conversations are retrieved through REST APIs before real-time updates resume. Additional events such as typing indicators, online status, and read receipts can be incorporated to enhance user experience.

### Notification Flow

NestMatch provides both email and in-app notifications for important events.

When a tenant expresses interest in a property, the backend creates an Interest record with a **PENDING** status. The compatibility score is calculated immediately. If the score exceeds a predefined threshold (for example, 80%), an email notification is sent to the property owner, encouraging quick review.

When the owner accepts or declines the request, the backend updates the Interest status and triggers notifications for the tenant. Accepted requests unlock the chat feature, while declined requests notify the tenant of the decision.

Real-time notifications are delivered through Socket.IO whenever users are online. If a recipient is offline, the notification is stored and delivered through email or displayed upon the next login. This hybrid approach ensures users receive timely updates regardless of their online status while maintaining consistency between database records and client interfaces.
