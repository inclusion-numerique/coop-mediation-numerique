import type { Result } from '@/libraries/result'
import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { DemandeDeRapprochement } from '../../../domain/ports'
import type { BeneficiaireFusionne, RdvPourActivite } from './rdv-pour-activite'

export type LireRdvPourActivite = (
  rdvId: RdvId,
) => Promise<RdvPourActivite | null>

export type CompteDuRedacteur = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

export type CreerOuFusionnerBeneficiaires = (
  demande: DemandeDeRapprochement,
) => Promise<
  Result<{ readonly merges: readonly BeneficiaireFusionne[] }, never>
>

type RendezVousASaisir = {
  readonly id: RdvId
  readonly debut: Date
  readonly dureeEnMinutes: number
  readonly titre: string | null
  readonly collectif: boolean
}

export type PreparerUrlCreationCra = (saisie: {
  readonly rendezVous: RendezVousASaisir
  readonly mediateurId: MediateurId
  readonly beneficiaires: readonly BeneficiaireFusionne[]
}) => Promise<string>

export type CreerActiviteDepuisRdvPorts = {
  readonly lireRdv: LireRdvPourActivite
  readonly compteDuRedacteur: CompteDuRedacteur
  readonly creerOuFusionnerBeneficiaires: CreerOuFusionnerBeneficiaires
  readonly preparerUrlCreationCra: PreparerUrlCreationCra
}
