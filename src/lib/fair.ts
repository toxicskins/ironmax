import crypto from "crypto";

// Provably-fair core: HMAC-SHA256(serverSeed, `${clientSeed}:${nonce}`) -> stream of floats in [0,1).
// Every game outcome is derived from this single primitive so adding a game never means adding new randomness code.
export function serverSeedHash(serverSeed: string) {
  return crypto.createHash("sha256").update(serverSeed).digest("hex");
}

export function newServerSeed() {
  return crypto.randomBytes(32).toString("hex");
}

function hmacBytes(serverSeed: string, clientSeed: string, nonce: number, cursor: number) {
  return crypto
    .createHmac("sha256", serverSeed)
    .update(`${clientSeed}:${nonce}:${cursor}`)
    .digest();
}

/** Deterministic stream of floats in [0,1), reproducible and auditable from (serverSeed, clientSeed, nonce). */
export function floatStream(serverSeed: string, clientSeed: string, nonce: number) {
  let cursor = 0;
  let buf = hmacBytes(serverSeed, clientSeed, nonce, cursor);
  let offset = 0;
  return function next(): number {
    if (offset + 4 > buf.length) {
      cursor++;
      buf = hmacBytes(serverSeed, clientSeed, nonce, cursor);
      offset = 0;
    }
    const int = buf.readUInt32BE(offset);
    offset += 4;
    return int / 0x100000000;
  };
}

export function randInt(next: () => number, min: number, max: number) {
  return min + Math.floor(next() * (max - min + 1));
}

export function shuffled<T>(next: () => number, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(next, 0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
