import { registerAs } from '@nestjs/config';

export interface AppConfig {
  baseUrl: string;
  host: string;
  port: number;
  oauth2CallbackUrl: string;
}

const getBaseUrl = () => {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  if (process.env.HOST) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    return `http://${process.env.HOST}:${port}`;
  }
  return 'http://localhost:3000';
};

export default registerAs<AppConfig>('app', () => ({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  baseUrl: getBaseUrl(),
  oauth2CallbackUrl: `${getBaseUrl()}/oauth2/callback`,
}));
