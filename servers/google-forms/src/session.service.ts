import { Injectable, Logger } from '@nestjs/common';

export interface Session {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class SessionRepository {
  // initially, memory only
  private sessions: Map<string, Session> = new Map();
  private readonly logger = new Logger(SessionRepository.name);

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async updateSession(session: Session): Promise<void> {
    this.sessions.set(session.sessionId, session);
  }
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  constructor(private readonly sessionRepository: SessionRepository) {}

  async getSession(sessionId: string): Promise<Session | undefined> {
    const session = await this.sessionRepository.getSession(sessionId);
    return session;
  }

  async upsertSession(session: Session): Promise<void> {
    await this.sessionRepository.updateSession(session);
  }
}
