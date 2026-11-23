export type HealthResponse = {
  status: 'ok' | 'error'
}

export const apiDisponible = (): HealthResponse => ({ status: 'ok' })
