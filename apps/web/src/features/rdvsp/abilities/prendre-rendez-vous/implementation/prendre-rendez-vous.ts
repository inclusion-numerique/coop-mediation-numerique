import { success } from '@app/web/libraries/result'
import { UrlRetour } from '../../../domain/demande-rdv'
import type { RdvServicePublicApi } from '../../../domain/rdv-service-public.port'
import type { BeneficiaireCibleId } from '../domain/beneficiaire-cible'
import {
  type BeneficiaireADemander,
  type CompteDuMediateur,
  demandePourBeneficiaire,
  type LierUsagerAuBeneficiaire,
  type PrendreRendezVous,
  verifierBeneficiaire,
  verifierCompte,
} from '../domain/prendre-rendez-vous'

export type DependancesPrendreRendezVous = {
  readonly beneficiaireADemander: BeneficiaireADemander
  readonly compteDuMediateur: CompteDuMediateur
  readonly creerDemandeRdv: RdvServicePublicApi['creerDemandeRdv']
  readonly lierUsager: LierUsagerAuBeneficiaire
  /** Construit l'URL du dossier d'accompagnement, qui dépend de l'hôte. */
  readonly urlDossierBeneficiaire: (id: BeneficiaireCibleId) => string
}

/**
 * Le rattachement de l'usager suit immédiatement la création de la demande : le
 * bénéficiaire porte dès lors l'identifiant RDV Service Public, et la demande
 * suivante désignera cet usager au lieu d'en réclamer un nouveau.
 */
export const prendreRendezVous =
  ({
    beneficiaireADemander,
    compteDuMediateur,
    creerDemandeRdv,
    lierUsager,
    urlDossierBeneficiaire,
  }: DependancesPrendreRendezVous): PrendreRendezVous =>
  async ({ utilisateurId, mediateurId, beneficiaireId }) => {
    const verifie = verifierBeneficiaire({
      beneficiaire: await beneficiaireADemander(beneficiaireId),
      mediateurId,
      beneficiaireId,
    })

    if (!verifie.success) {
      return verifie
    }

    const compte = verifierCompte(await compteDuMediateur(utilisateurId))

    if (!compte.success) {
      return compte
    }

    const demande = await creerDemandeRdv(
      compte.data,
      demandePourBeneficiaire(
        verifie.data,
        UrlRetour(urlDossierBeneficiaire(beneficiaireId)),
      ),
    )

    if (!demande.success) {
      return demande
    }

    await lierUsager({
      beneficiaire: verifie.data,
      usagerId: demande.data.usagerId,
    })

    return success(demande.data)
  }
