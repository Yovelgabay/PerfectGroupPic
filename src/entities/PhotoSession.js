// src/entities/PhotoSession.js
export class PhotoSession {
  static STORAGE_KEY = 'photo_sessions';

  static _read() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static _write(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore storage errors */
    }
  }

  static async create(data) {
    const sessions = this._read();
    const id = Date.now().toString();
    const newSession = {
      id,
      created_date: new Date().toISOString(),
      ...data,
    };
    sessions.push(newSession);
    this._write(sessions);
    return newSession;
  }

  static async update(id, updates) {
    const sessions = this._read();
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Session not found');
    sessions[index] = { ...sessions[index], ...updates };
    this._write(sessions);
    return sessions[index];
  }

  static async list() {
    return this._read();
  }

  static async filter(_query = {}, order = '', limit) {
    let sessions = [...this._read()];
    if (order === '-created_date') {
      sessions.sort(
        (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
    }
    if (typeof limit === 'number') {
      sessions = sessions.slice(0, limit);
    }
    return sessions;
  }
}
