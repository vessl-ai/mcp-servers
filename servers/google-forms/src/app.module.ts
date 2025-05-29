import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from '@rekog/mcp-nest';
import { AuthController } from './auth.controller';
import appConfig from './config/app.config';
import googleConfig from './config/google.config';
import { GoogleFormsTool } from './google-forms.tool';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'google-forms',
      version: '1.0.0',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [googleConfig, appConfig],
    }),
  ],
  controllers: [AuthController],
  providers: [GoogleFormsTool],
})
export class AppModule {}
