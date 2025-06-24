let sessions = [];

function generateId() {
  return Date.now().toString();
}

export const PhotoSession = {
  async list() {
    return sessions;
  },
  async filter(query = {}, sort, limit) {
    let result = sessions;
    if (query.created_by) {
      result = result.filter(s => s.created_by === query.created_by);
    }
    if (sort) {
      const key = sort.replace('-', '');
      const desc = sort.startsWith('-');
      result = result.slice().sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av === bv) return 0;
        return desc ? (av > bv ? -1 : 1) : (av < bv ? -1 : 1);
      });
    }
    if (limit) {
      result = result.slice(0, limit);
    }
    return result;
  },
  async create(data) {
    const session = { id: generateId(), created_date: new Date().toISOString(), ...data };
    sessions.push(session);
    return session;
  },
  async update(id, data) {
    const idx = sessions.findIndex(s => s.id === id);
    if (idx !== -1) {
      sessions[idx] = { ...sessions[idx], ...data };
    }
    return sessions[idx];
  }
};
