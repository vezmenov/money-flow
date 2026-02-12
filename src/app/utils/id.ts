export function createClientId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const randomPart = Math.random().toString(16).slice(2);
  return `local-${Date.now()}-${randomPart}`;
}
