import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  private authClient: OAuth2Client;
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    const clientId = this.configService.get<string>('google.clientId');
    const clientSecret = this.configService.get<string>('google.clientSecret');
    const redirectUri = this.configService.get('app.oauth2CallbackUrl');
    this.authClient = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  async initiateOauth2(sessionId: string, scope: string[]): Promise<string> {
    this.logger.log(`Initiating OAuth2 for session ${sessionId}`);
    const redirectUri = this.configService.get('app.oauth2CallbackUrl');

    const authUrl = this.authClient.generateAuthUrl({
      access_type: 'offline',
      scope,
      redirect_uri: redirectUri,
      state: sessionId,
    });
    return authUrl;
  }

  async handleOauth2Callback(code: string, sessionId: string): Promise<void> {
    this.logger.log(`Handling OAuth2 callback for session ${sessionId}`);
    const { tokens } = await this.authClient.getToken(code);
    this.logger.log(`Tokens: ${JSON.stringify(tokens)}`);
    if (!tokens.access_token) {
      throw new Error('Access token or refresh token not found');
    }

    let session = await this.sessionService.getSession(sessionId);
    if (!session) {
      session = {
        sessionId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? '',
      };
    }
    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token ?? '';
    await this.sessionService.upsertSession(session);
    this.logger.log(`Session updated for session ${sessionId}`);
  }

  async getAuthClient(sessionId: string): Promise<OAuth2Client> {
    const session = await this.sessionService.getSession(sessionId);
    if (!session) {
      throw new Error(
        `Session ${sessionId} not found, please start OAuth2 authentication first`,
      );
    }
    const authClient = new OAuth2Client(
      this.configService.get<string>('google.clientId'),
      this.configService.get<string>('google.clientSecret'),
      this.configService.get('app.oauth2CallbackUrl'),
    );
    authClient.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });
    return authClient;
  }
}
