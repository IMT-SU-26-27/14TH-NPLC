// Auth cookies go over HTTPS only in production; local dev runs on http://localhost.
// HttpOnly stays off (the @supabase/ssr default): the browser client reads the session from document.cookie.
export const authCookieOptions = { secure: process.env.NODE_ENV === "production" };
