import {
  type ClientApi,
  ClientApiId,
  type DefinitionDuClientApi,
  NomDuClientApi,
  PorteeApi,
} from '@app/web/features/clients-api/domain'
import type { ApiClientScope } from '@app/web/generated/prisma/client'

export const clientApiSelect = {
  id: true,
  name: true,
  scopes: true,
  validFrom: true,
  validUntil: true,
  created: true,
  updated: true,
} as const

export type LigneClientApi = {
  id: string
  name: string
  scopes: ApiClientScope[]
  validFrom: Date
  validUntil: Date | null
  created: Date
  updated: Date
}

export const versClientApi = (ligne: LigneClientApi): ClientApi => ({
  id: ClientApiId(ligne.id),
  nom: NomDuClientApi(ligne.name),
  portees: ligne.scopes.map((scope) => PorteeApi(scope)),
  validite: { debut: ligne.validFrom, fin: ligne.validUntil },
  creeLe: ligne.created,
  modifieLe: ligne.updated,
})

export const depuisDefinition = ({
  nom,
  portees,
  validite,
}: DefinitionDuClientApi) => ({
  name: nom,
  scopes: [...portees],
  validFrom: validite.debut,
  validUntil: validite.fin,
})
