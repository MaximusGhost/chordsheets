// Polyfill globalThis.crypto for Node.js 18 environments
// Azure SDKs require the Web Crypto API (globalThis.crypto)
// which is stable in Node.js 20+ but experimental in Node.js 18
import { webcrypto } from 'crypto';

if (typeof globalThis.crypto === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).crypto = webcrypto;
}
