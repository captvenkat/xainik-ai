import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const COOKIE = 'xainik_did';

export function getOrSetDeviceId() {
  const jar = cookies();
  let id = jar.get(COOKIE)?.value;
  if (!id) {
    id = randomUUID();
    jar.set(COOKIE, id, { 
      path: '/', 
      sameSite: 'lax', 
      maxAge: 60 * 60 * 24 * 365 * 5 // 5 years
    });
  }
  return id;
}
