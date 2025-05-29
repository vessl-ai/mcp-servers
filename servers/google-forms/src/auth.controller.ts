import { Controller, Get, Query } from '@nestjs/common';
import { GoogleFormsTool } from './google-forms.tool';

@Controller('oauth2')
export class AuthController {
  constructor(private readonly googleFormsTool: GoogleFormsTool) {}

  @Get('callback')
  async callback(@Query('code') code: string, @Query('scope') scope: string[]) {
    console.log('Callback received', code, scope);
    return this.googleFormsTool.authCallback(code);
  }
}
