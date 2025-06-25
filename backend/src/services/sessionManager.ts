import { v4 as uuidv4 } from 'uuid';
import { Session, SessionPermissions } from '../types';

class SessionManager {
  private sessions = new Map<string, Session>();
  private sessionsByCodes = new Map<string, string>();

  // Generate a 6-digit session code
  private generateSessionCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createSession(guestId: string): Promise<Session> {
    let code: string;
    do {
      code = this.generateSessionCode();
    } while (this.sessionsByCodes.has(code));

    const session: Session = {
      id: uuidv4(),
      code,
      guestId,
      status: 'waiting',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      permissions: {
        screenShare: true,
        remoteControl: false,
        fileTransfer: false,
        audioShare: false
      }
    };

    this.sessions.set(session.id, session);
    this.sessionsByCodes.set(code, session.id);

    // Auto-cleanup after expiration
    setTimeout(() => {
      this.endSession(session.id);
    }, 30 * 60 * 1000);

    return session;
  }

  async joinSession(code: string, controllerId: string): Promise<Session> {
    const sessionId = this.sessionsByCodes.get(code);
    if (!sessionId) {
      throw new Error('Session not found');
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'connected') {
      throw new Error('Session already has a controller');
    }

    if (session.expiresAt < new Date()) {
      this.endSession(sessionId);
      throw new Error('Session expired');
    }

    session.controllerId = controllerId;
    session.status = 'connected';

    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByCode(code: string): Session | undefined {
    const sessionId = this.sessionsByCodes.get(code);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  updatePermissions(sessionId: string, permissions: Partial<SessionPermissions>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.permissions = { ...session.permissions, ...permissions };
    }
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'disconnected';
      this.sessionsByCodes.delete(session.code);
      this.sessions.delete(sessionId);
      console.log(`🔚 Session ended: ${session.code}`);
    }
  }

  // Get active sessions count for monitoring
  getActiveSessionsCount(): number {
    return Array.from(this.sessions.values())
      .filter(session => session.status === 'connected').length;
  }

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.endSession(sessionId);
      }
    }
  }
}

export const sessionManager = new SessionManager();

// Run cleanup every 5 minutes
setInterval(() => {
  sessionManager.cleanupExpiredSessions();
}, 5 * 60 * 1000);
