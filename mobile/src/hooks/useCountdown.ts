import { useEffect, useRef, useState } from 'react';
import { toCountdown, type CountdownBreakdown } from '../utils/format';

const EMPTY: CountdownBreakdown = toCountdown(0);

/**
 * Live countdown to an absolute ISO timestamp.
 *
 * `serverTime` (returned by the API on every competition response) is used to
 * compute the device's clock offset, so a wrong device clock never produces a
 * wrong countdown.
 */
export function useCountdown(target: string | null | undefined, serverTime?: string | null): CountdownBreakdown {
  const offsetRef = useRef(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (serverTime) {
      const server = new Date(serverTime).getTime();
      if (!Number.isNaN(server)) offsetRef.current = Date.now() - server;
    }
  }, [serverTime]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target) return EMPTY;

  const targetMs = new Date(target).getTime();
  if (Number.isNaN(targetMs)) return EMPTY;

  const serverNow = now - offsetRef.current;
  return toCountdown(targetMs - serverNow);
}
