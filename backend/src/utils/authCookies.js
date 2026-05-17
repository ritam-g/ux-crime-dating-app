/**
 * @file authCookies.js
 * @description Reusable helpers for setting and clearing auth cookies.
 *
 * Centralizing cookie options keeps login, register, and logout behavior
 * consistent and easy to change in one place.
 */
import config from "../config/config.js";

/**
 * @description Sets the JWT in an HTTP-only cookie.
 * @returns The response object after the cookie is attached.
 * @route N/A
 * @access Private
 */
export const setAuthCookie = (res, token) => {
  return res.cookie(config.jwtCookieName, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    maxAge: config.jwtCookieMaxAge,
    path: "/",
  });
};

/**
 * @description Clears the JWT cookie from the browser.
 * @returns The response object after the cookie is removed.
 * @route N/A
 * @access Private
 */
export const clearAuthCookie = (res) => {
  return res.clearCookie(config.jwtCookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    path: "/",
  });
};
