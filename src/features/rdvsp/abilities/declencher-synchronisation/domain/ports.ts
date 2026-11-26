import type { Result } from '@/libraries/result'
import type {
  CompteRdv,
  CompteRdvUtilisable,
} from '../../../domain/compte/compte-rdv'
import type { EchecDeSynchronisation } from '../../../domain/errors'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { MarquageDEchec } from './errors'

export type CompteACible = (utilisateurId: UtilisateurCoopId) => Promise<{
  readonly compte: CompteRdv
  readonly mediateurId: string | null
} | null>

export type SynchroniserLeCompte = (synchronisation: {
  readonly compte: CompteRdvUtilisable
  readonly mediateurId: string | null
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<Result<{ readonly derive: number }, EchecDeSynchronisation>>

export type MarquerEchecDeSynchronisation = (
  marquage: MarquageDEchec,
) => Promise<void>

export type SignalerLEchec = (erreur: unknown) => void

export type DeclencherSynchronisationPorts = {
  readonly compteACible: CompteACible
  readonly synchroniser: SynchroniserLeCompte
  readonly marquerEchec: MarquerEchecDeSynchronisation
  readonly signaler: SignalerLEchec
}
