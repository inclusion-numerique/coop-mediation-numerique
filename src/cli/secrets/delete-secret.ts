import { secretClient } from '@/cli/secrets/secret-client'

export const deleteSecret = (id: string) => secretClient.delete(`/${id}`)
