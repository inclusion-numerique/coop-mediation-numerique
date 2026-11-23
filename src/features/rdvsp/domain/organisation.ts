import type { OrganisationId } from './identifiants/organisation-id'
import type { EmailExterne, TelephoneExterne } from './identite'
import type { NomOrganisation } from './libelle'

/**
 * Organisation RDV Service Public. `verticale` distingue les déclinaisons du
 * service (RDV Solidarités, RDV Aide Numérique…) ; elle n'apparaît pas dans la
 * spécification publique mais est bien servie par l'API.
 */
export type Organisation = {
  readonly id: OrganisationId
  readonly nom: NomOrganisation
  readonly email: EmailExterne | null
  readonly telephone: TelephoneExterne | null
  readonly verticale: string | null
}
