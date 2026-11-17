import { secretClient } from '@/configuration/secrets/secretClient'

export const deleteSecret = (id: string) => secretClient.delete(`/${id}`)
