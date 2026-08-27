# 1. Auth & User Management LLD

## Interfaces Exposed

**POST /api/auth/register**
- **Request:** `{ email: string, password: string, fullName: string, phoneNumber?: string, countryOfResidence?: string, redirectUrl?: string }`
- **Response:** `201 Created` `{ message: string, user: { id, email, role, fullName, cvUrl, phoneNumber, nationality, psychometricModule1Passed, psychometricModule2Passed }, accessToken: string }`
- **Cookies:** Sets `refreshToken`

**POST /api/auth/register-admin**
- **Request:** Same as `/register`
- **Response:** Same as `/register` (role is ADMIN)

**POST /api/auth/login**
- **Request:** `{ email: string, password: string, redirectUrl?: string }`
- **Response:** `200 OK` `{ message, user, accessToken }` (similar to register)
- **Status codes:** 200 (Success), 401 (Invalid Credentials), 403 (Email not verified), 500
- **Cookies:** Sets `refreshToken`

**GET /api/auth/verify-email?token=string**
- **Request:** Query param `token`
- **Response:** `200 OK` `{ message: string }` | `400 Bad Request`

**POST /api/auth/forgot-password**
- **Request:** `{ email: string }`
- **Response:** `200 OK` `{ message: string }` | `500 Internal Server Error`

**POST /api/auth/reset-password**
- **Request:** `{ token: string, password: string }`
- **Response:** `200 OK` `{ message: string }` | `400 Bad Request`

**POST /api/auth/resend-verification**
- **Request:** `{ email: string, redirectUrl?: string }`
- **Response:** `200 OK` `{ message: string }`

**POST /api/auth/refresh**
- **Request:** Read `refreshToken` from cookies.
- **Response:** `200 OK` `{ accessToken: string }` | `401 Unauthorized`
- **Cookies:** Updates `refreshToken`

**GET /api/auth/me**
- **Request:** JWT Bearer Token (requires auth)
- **Response:** `200 OK` `{ user: { id, email, role, fullName, phoneNumber, dateOfBirth, gender, nationality, address, city, state, country, countryOfResidence, zipCode, cvUrl, languages, psychometricModule1Passed, psychometricModule2Passed } }`

**PUT /api/auth/profile**
- **Request:** Partial user object update
- **Response:** `200 OK` `{ message: string, user: { ... } }`

**PUT /api/auth/change-password**
- **Request:** `{ currentPassword: string, newPassword: string }`
- **Response:** `200 OK` `{ message: string }` | `401 Unauthorized`

**POST /api/auth/logout**
- **Request:** JWT Bearer Token
- **Response:** `200 OK` `{ message: string }`
- **Cookies:** Clears `refreshToken`

## Interfaces Consumed
- **ApplicationService:** `updateLatestApplicationStageStatus(userId, 'Bio Updated')`
- **Email Utilities:** `sendAuthEmail()`, `sendInfoEmail()`
- **Database (Sequelize):** `userRepository` methods (`findByEmail`, `create`, `update`, `findByVerificationToken`, `findByResetToken`, `findById`)

## Data Structures
- **User Record:** Contains auth tokens (verificationToken, resetPasswordToken, resetPasswordExpires), profile info (email, passwordHash, role, fullName, phoneNumber, etc.), and state flags (isVerified).

## Algorithms / Business Logic
- **Registration:**
  - Check if email exists; if yes, throw error.
  - Hash password (bcrypt rounds 12).
  - Generate a 32-byte hex `verificationToken`.
  - Create the user as unverified with role `APPLICANT` (or `ADMIN` for register-admin).
  - Send verification email containing the token link.
  - Send an admin notification email to `nnamdisolomon1@gmail.com` stating "Stage Update: Registered".
  - Return access token and set refresh token cookie.
- **Login:**
  - Find user by email. If not found, throw invalid credentials.
  - Compare passwords with bcrypt. If fail, throw invalid credentials.
  - Check `isVerified`. If false, trigger `resendVerification` automatically and throw `EMAIL_NOT_VERIFIED`.
  - Return access token and set refresh token cookie.
- **Verify Email:**
  - Find user by `verificationToken`. If none, throw invalid token.
  - Mark `isVerified = true` and nullify the token.
  - Dispatch a comprehensive Welcome Email detailing the 9-step recruitment process.
- **Profile Update:**
  - Update user record in DB.
  - Automatically advance the candidate's application stage to `Bio Updated` via `ApplicationService`.
  - Send a "Bio Updated" email to the user.

## State Machine
- **User verification state:** `isVerified: false` -> `isVerified: true` (triggered by `/verify-email`).
- **Application Stage (Side-effect):** Profile update triggers stage transition to `Bio Updated`.

## Error Handling
- Errors map to predefined `CONSTANTS.ERROR_MESSAGES`.
- `400 Bad Request` for email already exists or invalid verification/reset tokens.
- `401 Unauthorized` for invalid login credentials or missing/invalid refresh tokens.
- `403 Forbidden` for unverified email on login (with automatic resend of verification).
- `500 Internal Server Error` for generic try-catch fallbacks.

## Open Questions
- Admin registration (`/register-admin`) seems completely open/unprotected. Is this intended for a one-time setup, or is it a security vulnerability?
- Why does `AuthService` directly trigger application stage updates (`Bio Updated`) and admin notifications for "Stage Update: Registered"? This creates a tight coupling between Auth and the Jobs pipeline.
