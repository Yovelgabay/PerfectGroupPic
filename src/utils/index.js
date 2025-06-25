// src/utils/index.js
export const createPageUrl = (page) => `/${page.toLowerCase()}`;


// src/entities/PhotoSession.js
export class PhotoSession {
  static async filter(queryObj, orderBy, limit) {
    return Promise.resolve([]);  // empty list for now
  }
}
