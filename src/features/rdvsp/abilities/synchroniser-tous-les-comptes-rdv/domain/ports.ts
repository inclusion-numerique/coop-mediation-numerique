import type { Result } from '@/libraries/result'
import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { EchecDeLaSynchronisationDuCompte } from './errors'

export type LireLesComptesRdv = () => Promise<readonly CompteRdv[]>

export type DeclencherLaSynchronisation = (declenchement: {
  readonly demandeur: {
    readonly id: UtilisateurCoopId
    readonly role: 'User'
  }
  readonly utilisateurId: UtilisateurCoopId
  readonly seulementSansWebhook: false
  readonly maintenant: Date
}) => Promise<Result<unknown, EchecDeLaSynchronisationDuCompte>>

export type SynchroniserTousLesComptesRdvPorts = {
  readonly lireLesComptes: LireLesComptesRdv
  readonly declencher: DeclencherLaSynchronisation
}
