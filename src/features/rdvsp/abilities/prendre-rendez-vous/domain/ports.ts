import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { RdvServicePublicApi } from '../../../domain/ports'
import type { UrlRetour } from '../../../domain/rdv/demande-rdv'
import type {
  BeneficiaireCible,
  BeneficiaireCibleId,
} from './beneficiaire-cible'
import type { LiaisonUsager } from './rendez-vous-demande'

export type BeneficiaireADemander = (
  id: BeneficiaireCibleId,
) => Promise<BeneficiaireCible | null>

export type CompteDuMediateur = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

export type LierUsagerAuBeneficiaire = (liaison: LiaisonUsager) => Promise<void>

export type UrlDossierBeneficiaire = (id: BeneficiaireCibleId) => UrlRetour

export type PrendreRendezVousPorts = {
  readonly beneficiaireADemander: BeneficiaireADemander
  readonly compteDuMediateur: CompteDuMediateur
  readonly creerDemandeRdv: RdvServicePublicApi['creerDemandeRdv']
  readonly lierUsager: LierUsagerAuBeneficiaire
  readonly urlDossierBeneficiaire: UrlDossierBeneficiaire
}
