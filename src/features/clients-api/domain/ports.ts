import type { ClientApiId } from './client-api-id'

export type ClientApiExiste = (id: ClientApiId) => Promise<boolean>
