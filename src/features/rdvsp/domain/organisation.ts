import type { OrganisationId } from './identifiants/organisation-id'
import type { EmailExterne, TelephoneExterne } from './identite'
import type { NomOrganisation } from './libelle'

export type Organisation = {
  readonly id: OrganisationId
  readonly nom: NomOrganisation
  readonly email: EmailExterne | null
  readonly telephone: TelephoneExterne | null
  readonly verticale: string | null
}
