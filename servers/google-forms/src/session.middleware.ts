import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import * as querystring from 'querystring';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const queryparam = req.url.split('?')[1];
    const queryParams = querystring.parse(queryparam);
    const sessionId = queryParams.sessionId;
    if (sessionId) {
      req['sessionId'] = sessionId;
    }
    next();
  }
}
