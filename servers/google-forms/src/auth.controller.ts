import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('oauth2')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('scope') scope: string[],
    @Query('state') state: string,
  ) {
    const sessionId = state;
    console.log('Callback received', code, scope, state);
    await this.authService.handleOauth2Callback(code, sessionId);
    return 'Success! Go back to your client.';
  }
}
