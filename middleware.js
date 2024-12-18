import { dbPromise } from './db.js';

export async function authenticateMiddleware(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return next();
  }

  try {
    const authToken = await dbPromise.get('SELECT * FROM authtokens WHERE token = ?', [token]);
    if (!authToken) {
      return next();
    }

    const user = await dbPromise.get('SELECT * FROM users WHERE user_id = ?', [authToken.user_id]);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    console.error(err);
  }

  next();
}
