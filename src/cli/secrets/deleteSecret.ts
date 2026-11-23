import { secretClient } from '@/cli/secrets/secretClient'

export const deleteSecret = (id: string) => secretClient.delete(`/${id}`)
