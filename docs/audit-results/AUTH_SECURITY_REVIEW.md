# Auth Security Review — DevStash

**Last audited:** 2026-06-01
**Auditor:** auth-auditor subagent
**Scope:** Custom auth code only (NextAuth v5 built-in protections excluded)

---

## Summary

The auth implementation is structurally sound: bcrypt rounds are strong, tokens are cryptographically secure, token expiry is enforced, and protected mutations verify the session. The most significant gaps are the complete absence of rate limiting on all auth endpoints (which exposes sign-in to credential stuffing and forgot-password to email spam abuse) and an open redirect in the sign-in flow via an unvalidated `callbackUrl` query parameter. Six findings are documented below, ranging from High to Low severity.

---

## Findings

---

### [HIGH] No rate limiting on any auth endpoint

- **Files:**
  - `src/app/api/auth/register/route.ts`
  - `src/app/api/auth/forgot-password/route.ts`
  - `src/app/api/auth/resend-verification/route.ts`
  - `src/app/api/auth/change-password/route.ts`
  - NextAuth credentials sign-in (handled by `src/auth.ts` authorize callback)
- **Issue:** None of the auth endpoints implement rate limiting or request throttling. This exposes several attack vectors:
  - **Credential stuffing / brute-force**: An attacker can try unlimited email/password combinations against the credentials sign-in endpoint.
  - **Email spam abuse**: `/api/auth/forgot-password` and `/api/auth/resend-verification` will send an email on every call with no cooldown or per-IP/per-email cap, allowing an attacker to flood a victim's inbox.
  - **Account enumeration amplification**: Combined with enumeration issues (see below), an attacker can efficiently probe which emails are registered.
- **Fix:** Add rate limiting using an in-memory store (e.g. `lru-cache` + a leaky-bucket, or the `@upstash/ratelimit` library if Redis is available). For example, limit forgot-password to 3 requests per email per 15 minutes and sign-in to 10 attempts per IP per 10 minutes. A minimal in-process example:

  ```ts
  // src/lib/rate-limit.ts  (in-process, resets on deploy — acceptable for MVP)
  import { LRUCache } from "lru-cache";

  const cache = new LRUCache<string, number[]>({ max: 5000 });

  export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = (cache.get(key) ?? []).filter((t) => now - t < windowMs);
    if (timestamps.length >= limit) return false;
    cache.set(key, [...timestamps, now]);
    return true;
  }
  ```

  Then in the route handler:
  ```ts
  if (!rateLimit(`forgot-password:${email}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json({ success: true }); // silent — don't reveal the limit
  }
  ```

---

### [HIGH] Open redirect via unvalidated `callbackUrl`

- **File:** `src/app/(auth)/sign-in/page.tsx:10`, `src/app/(auth)/sign-in/_form.tsx:31,88,190`
- **Issue:** The sign-in page reads `callbackUrl` directly from the URL search params and passes it through to `SignInForm`, which uses it in `router.push(callbackUrl)` (line 88) and `signIn("github", { callbackUrl })` (line 190) without any validation. An attacker can craft a phishing link such as:

  ```
  https://devstash.app/sign-in?callbackUrl=https://evil.com/steal-session
  ```

  After a legitimate sign-in, the user is silently redirected to the attacker's domain. The NextAuth `signIn()` call also forwards the unvalidated URL to the OAuth flow, which could bypass NextAuth's own origin check depending on provider configuration.
- **Fix:** Validate that `callbackUrl` is a relative path (starts with `/`) or matches the app's own origin before using it. Drop it otherwise and fall back to `/dashboard`:

  ```ts
  // In page.tsx, sanitize before passing to the form:
  function sanitizeCallbackUrl(url: string | undefined): string {
    if (!url) return "/dashboard";
    try {
      // Allow only relative paths
      if (url.startsWith("/") && !url.startsWith("//")) return url;
      // Allow same-origin absolute URLs
      const parsed = new URL(url);
      if (parsed.origin === process.env.AUTH_URL) return url;
    } catch {
      // not a valid URL — ignore
    }
    return "/dashboard";
  }
  ```

---

### [MEDIUM] User enumeration via `resend-verification` endpoint

- **File:** `src/app/api/auth/resend-verification/route.ts:21`
- **Issue:** The endpoint returns a 400 `"Email is already verified"` response when the email belongs to an already-verified user (line 21), but returns a 200 `{ success: true }` when the email is not registered (line 18). This inconsistency lets an attacker determine:
  1. Whether an email address has a DevStash account (200 for unknown vs 400 for verified known accounts).
  2. Whether a known account is already verified.

  ```ts
  // Line 21 — leaks account state:
  if (user.emailVerified) {
    return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
  }
  ```

- **Fix:** Always return `{ success: true }` with a 200 regardless of whether the email exists or is already verified. If a UX message is needed, show it client-side only for logged-in users.

  ```ts
  // Return the same response regardless of what we find
  if (!user || !user.password || user.emailVerified) {
    return NextResponse.json({ success: true }, { status: 200 });
  }
  ```

---

### [MEDIUM] Email addresses not normalised before storage or lookup

- **Files:**
  - `src/app/api/auth/register/route.ts:30` — `findUnique({ where: { email } })`
  - `src/auth.ts:57` — `findUnique({ where: { email } })`
  - `src/app/api/auth/forgot-password/route.ts:15`
  - `src/app/api/auth/resend-verification/route.ts:15`
- **Issue:** Email addresses are stored and compared exactly as submitted. RFC 5321 specifies that the domain part is case-insensitive; most providers also treat the local part (before `@`) as case-insensitive in practice. This means `User@Example.com`, `user@example.com`, and `USER@EXAMPLE.COM` can all register as separate accounts, leading to duplicate accounts for the same mailbox, broken password reset (the lookup may miss the stored variant), and potential auth bypass if an attacker registers the mixed-case variant of a taken email.
- **Fix:** Normalise email to lowercase before every storage and lookup operation:

  ```ts
  const normalizedEmail = email.trim().toLowerCase();
  // Use normalizedEmail everywhere in place of email
  ```

  Apply this in all route handlers: `register`, `forgot-password`, `resend-verification`, and in the `authorize` callback in `src/auth.ts`.

---

### [MEDIUM] No CSRF protection on custom POST API routes

- **Files:**
  - `src/app/api/auth/register/route.ts`
  - `src/app/api/auth/change-password/route.ts`
  - `src/app/api/auth/delete-account/route.ts`
  - `src/app/api/auth/forgot-password/route.ts`
  - `src/app/api/auth/resend-verification/route.ts`
  - `src/app/api/auth/reset-password/route.ts`
- **Issue:** Next.js App Router does **not** apply automatic CSRF protection to custom API routes — only the NextAuth-managed `/api/auth/*` (signin, signout, etc.) routes are CSRF-protected by the framework. The custom routes listed above are plain Next.js Route Handlers and receive no CSRF token validation. An attacker on a third-party site could therefore submit a cross-origin form targeting, for example, `POST /api/auth/change-password` or `DELETE /api/auth/delete-account`.

  In practice the risk is partially mitigated by the JSON `Content-Type` requirement (simple HTML forms cannot send `application/json`), but this is a defense-in-depth gap, not a full mitigation — `fetch()` from any origin can send JSON with `Content-Type: application/json`.

  The authenticated routes (`change-password`, `delete-account`) rely on the NextAuth JWT session cookie, which is `SameSite=Lax` by default, providing meaningful protection against most cross-site request forgery. However, the unauthenticated routes (`register`, `forgot-password`, `resend-verification`, `reset-password`) have no such protection.
- **Fix:** For the unauthenticated mutation routes, verify the `Origin` or `Referer` header matches your app's domain as a minimal check:

  ```ts
  const origin = request.headers.get("origin");
  const allowedOrigin = process.env.AUTH_URL ?? "http://localhost:3000";
  if (origin && origin !== allowedOrigin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  ```

  For the authenticated mutation routes (`change-password`, `delete-account`), the `SameSite=Lax` cookie already prevents the most common cross-site attack vectors; the Origin check above is still recommended as defense-in-depth.

---

### [LOW] No maximum password length — bcrypt 72-byte truncation silently mismatches

- **Files:**
  - `src/app/api/auth/register/route.ts:26`
  - `src/app/api/auth/reset-password/route.ts:22`
  - `src/components/profile/ChangePasswordForm.tsx:30`
- **Issue:** The code enforces a minimum password length of 8 characters but no maximum. The underlying bcrypt algorithm silently truncates input at 72 bytes. Two passwords that differ only after position 72 will hash identically and both authenticate successfully, which is unexpected behaviour. A user who sets a 100-character password is actually only protected by the first 72 characters.
- **Fix:** Add a server-side maximum length check (e.g. 72 or 128 characters) in all three route handlers and surface a clear error message:

  ```ts
  if (password.length > 128) {
    return NextResponse.json(
      { error: "Password must be 128 characters or fewer" },
      { status: 400 }
    );
  }
  ```

---

## Passed Checks

- **bcrypt rounds are strong** — All password hashing uses `bcrypt.hash(password, 12)`. 12 rounds is above the OWASP minimum recommendation of 10 and provides solid protection against offline attacks.

- **Token generation is cryptographically secure** — Both `issueVerificationToken` and `issuePasswordResetToken` use `randomUUID()` from Node's built-in `crypto` module, which is a CSPRNG. No weak Math.random or timestamp-based token generation.

- **Token expiry is checked before acceptance** — `verify-email/route.ts:16` checks `verificationToken.expires < new Date()` before acting. `reset-password/route.ts:32` does the same for password-reset tokens.

- **Tokens are deleted immediately after use (single-use enforcement)** — `verify-email/route.ts` deletes the token atomically inside a Prisma `$transaction` with the user update (lines 23–29). `reset-password/route.ts` deletes the token at line 45 after the password update. Expired tokens are also cleaned up on access.

- **Old tokens are invalidated on re-issue** — Both `issueVerificationToken` and `issuePasswordResetToken` call `prisma.verificationToken.deleteMany({ where: { identifier } })` before creating a new one, preventing multiple valid tokens from coexisting.

- **Namespace separation for token types** — Password-reset tokens use the identifier prefix `password-reset:{email}`, and the reset endpoint verifies this prefix (line 28), preventing a verification token from being used as a password-reset token and vice versa.

- **Session validation on all authenticated mutations** — Both `change-password/route.ts` and `delete-account/route.ts` call `auth()` and check `session?.user?.id` before processing the request, returning 401 otherwise.

- **Change-password verifies current password** — `change-password/route.ts` (line 41) uses `bcrypt.compare` to verify the user's current password before allowing a change, preventing session-hijack escalation.

- **forgot-password does not enumerate by account type** — The endpoint silently no-ops for OAuth-only accounts (no `password` field) and always returns 200, which correctly avoids leaking whether a given email is registered with a password.

- **Proxy middleware protects dashboard and profile routes** — `src/proxy.ts` uses the NextAuth edge-safe `auth()` wrapper to redirect unauthenticated requests to `/sign-in` for both `/dashboard` and `/profile` paths.

- **Email verification blocks sign-in** — The `signIn` callback in `src/auth.ts` (lines 17–23) checks `emailVerified` for credentials users when `EMAIL_VERIFICATION_ENABLED` is true, redirecting unverified users before a session is issued.

- **bcrypt.compare is timing-safe by design** — `bcryptjs` performs a constant-time comparison internally; this is not a timing-attack vector.

---

## Notes

- **JWT sessions and post-deletion validity:** The app uses NextAuth's JWT session strategy (`strategy: "jwt"`). Because session tokens are stored in a signed cookie rather than the database, deleting a user account (`DELETE /api/auth/delete-account`) does not immediately invalidate any active JWT cookies. A user's existing session cookie remains valid until its natural expiry (NextAuth's default is 30 days). The `DeleteAccountDialog` calls `signOut()` after deletion to clear the cookie on the deleting client, but any other active sessions (other browsers, devices) would remain valid for up to 30 days. This is a known trade-off of stateless JWT sessions. To mitigate, consider configuring a shorter `session.maxAge` (e.g. 24 hours) in `src/auth.ts`, or switching to a database session strategy for immediate invalidation.

- **EMAIL_VERIFICATION_ENABLED flag:** The flag defaults to `true` (enabled) when the environment variable is absent, and only disables when explicitly set to `"false"`. This is the safe default direction — new deployments are protected unless intentionally opted out. The flag is documented in `.env.example`. This is correctly implemented.

- **`callbackUrl` forwarding in NextAuth's own OAuth flow:** NextAuth v5 validates `callbackUrl` against `trustHost` and its own allow-list when it processes OAuth redirects. However, the custom `router.push(callbackUrl)` on line 88 of `_form.tsx` runs after NextAuth has already completed the sign-in — at that point the URL is handled by Next.js routing, which will follow any value including external URLs. This is the actual attack surface (see High finding above).
