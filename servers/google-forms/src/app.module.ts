import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from '@rekog/mcp-nest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import appConfig from './config/app.config';
import googleConfig from './config/google.config';
import { GoogleFormsTool } from './google-forms.tool';
import { SessionMiddleware } from './session.middleware';
import { SessionRepository, SessionService } from './session.service';

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
  providers: [GoogleFormsTool, AuthService, SessionService, SessionRepository],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
