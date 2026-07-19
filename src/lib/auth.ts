export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "123456";
export const SESSION_COOKIE = "tour_saas_session";
export const SESSION_VALUE = "authenticated";

export function validateCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function isAuthenticated(sessionValue: string | undefined) {
  return sessionValue === SESSION_VALUE;
}
