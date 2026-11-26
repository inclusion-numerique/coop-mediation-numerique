import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { CreerOuFusionnerDepuisUsagersExternes } from '../../../domain/ports'
import type {
  BeneficiaireFusionne,
  MediateurRedacteurId,
  RdvPourActivite,
} from './rdv-pour-activite'

export type LireRdvPourActivite = (
  rdvId: RdvId,
) => Promise<RdvPourActivite | null>

export type CompteDuRedacteur = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

export type CreerOuFusionnerBeneficiaires =
  CreerOuFusionnerDepuisUsagersExternes<BeneficiaireFusionne>

type RendezVousASaisir = {
  readonly id: RdvId
  readonly debut: Date
  readonly dureeEnMinutes: number
  readonly titre: string | null
  readonly collectif: boolean
}

export type PreparerUrlCreationCra = (saisie: {
  readonly rendezVous: RendezVousASaisir
  readonly mediateurId: MediateurRedacteurId
  readonly beneficiaires: readonly BeneficiaireFusionne[]
}) => Promise<string>

export type CreerActiviteDepuisRdvPorts = {
  readonly lireRdv: LireRdvPourActivite
  readonly compteDuRedacteur: CompteDuRedacteur
  readonly creerOuFusionnerBeneficiaires: CreerOuFusionnerBeneficiaires
  readonly preparerUrlCreationCra: PreparerUrlCreationCra
}
