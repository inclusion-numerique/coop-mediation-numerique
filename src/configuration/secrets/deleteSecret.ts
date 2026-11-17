import { secretClient } from '@app/web/configuration/secrets/secretClient'

export const deleteSecret = (id: string) => secretClient.delete(`/${id}`)
