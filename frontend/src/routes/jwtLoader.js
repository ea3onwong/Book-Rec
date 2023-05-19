import * as jose from 'jose';
import Cookies from 'js-cookie';

export default async function jwtLoader() {
  const token = Cookies.get('token');
  if (!token) return null;

  const res = await fetch(`${process.env.PUBLIC_URL}/data/jwt.pub`);
  const key = await res.text();

  try {
    const publicKey = await jose.importSPKI(key, 'RS256');
    const { payload } = await jose.jwtVerify(token, publicKey, { algorithms: ['RS256'] });
    return payload;
  } catch (err) {
    window.location.href = '/logout-invalid';
    return null;
  }
}
