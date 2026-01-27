// lib/is-client.ts
export const isClient = (): boolean => {
  return typeof window !== 'undefined'
}
