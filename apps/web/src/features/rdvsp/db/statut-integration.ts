import {
  type StatutIntegration,
  santeDuCompte,
  statutIntegration,
} from '../domain/sante-compte'
import { type CompteRdvRow, compteRdvToDomain } from './compte-rdv.transfer'

export type CompteRdvSessionRow = Omit<CompteRdvRow, 'organisations'> & {
  organisations: readonly { organisation: { id: number } }[]
}

/**
 * Statut de l'intégration tel que la session le transporte jusqu'aux écrans.
 *
 * Il est calculé côté serveur, à partir du compte complet, et non recomposé par
 * chaque écran depuis les quelques champs que la session expose : les jetons
 * n'en font pas partie, et sans eux on ne peut pas distinguer une déconnexion
 * volontaire d'une révocation. C'est la confusion que faisait la version
 * précédente, qui vivait à côté du domaine sans le consulter.
 */
export const statutIntegrationDeLaSession = (
  row: CompteRdvSessionRow,
  maintenant: Date,
): StatutIntegration =>
  statutIntegration(
    santeDuCompte(
      compteRdvToDomain({
        ...row,
        organisations: row.organisations.map(({ organisation }) => ({
          organisationId: organisation.id,
        })),
      }),
      maintenant,
    ),
  )
