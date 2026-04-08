export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}
