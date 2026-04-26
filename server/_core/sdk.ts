/**
 * Manus SDK stub — OAuth/Manus integration is disabled.
 * Authentication is handled via password-based login in auth.ts.
 */

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

class SDKServer {
  async exchangeCodeForToken(_code: string, _state: string): Promise<never> {
    throw new Error("OAuth not configured");
  }

  async getUserInfo(_accessToken: string): Promise<never> {
    throw new Error("OAuth not configured");
  }

  async createSessionToken(_openId: string, _options?: object): Promise<string> {
    throw new Error("Use server/_core/auth.ts createSessionToken instead");
  }

  async verifySession(_cookieValue: string | undefined | null): Promise<null> {
    return null;
  }

  async authenticateRequest(_req: unknown): Promise<never> {
    throw new Error("OAuth not configured — use password auth");
  }
}

export const sdk = new SDKServer();
