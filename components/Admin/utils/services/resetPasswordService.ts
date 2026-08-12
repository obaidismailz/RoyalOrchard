/**
 * Service to handle API calls for Password Reset operations.
 */

const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

export const resetPasswordService = {
  /**
   * Request reset password link API call
   */
  requestReset: async (email: string) => {
    const res = await fetch(`${getBaseUrl()}v1/auth/reset-password-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res;
  },

  /**
   * Complete password reset / change password API call
   */
  changePassword: async (token: string, email: string, password: string, passwordConfirmation: string) => {
    const url = `${getBaseUrl()}v1/auth/change-password/?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        password_confirmation: passwordConfirmation
      })
    });
    return res;
  }
};
