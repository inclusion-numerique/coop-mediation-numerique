import { success } from '@app/web/libraries/result'
import {
  type CompteDuRedacteur,
  type CreerActiviteDepuisRdv,
  type CreerOuFusionnerBeneficiaires,
  type LireRdvPourActivite,
  type PreparerUrlCreationCra,
  usagersPourActivite,
  verifierRdv,
} from '../domain/creer-activite-depuis-rdv'

export type DependancesCreerActiviteDepuisRdv = {
  readonly lireRdv: LireRdvPourActivite
  readonly compteDuRedacteur: CompteDuRedacteur
  readonly creerOuFusionnerBeneficiaires: CreerOuFusionnerBeneficiaires
  readonly preparerUrlCreationCra: PreparerUrlCreationCra
}

/**
 * Aucune activité n'est créée ici — le médiateur reste maître de son CRA. Ce que
 * l'ability produit, c'est le lien vers un formulaire déjà rempli, et l'effet de
 * bord qui le rend possible : les bénéficiaires des participants existent
 * désormais dans La Coop.
 */
export const creerActiviteDepuisRdv =
  ({
    lireRdv,
    compteDuRedacteur,
    creerOuFusionnerBeneficiaires,
    preparerUrlCreationCra,
  }: DependancesCreerActiviteDepuisRdv): CreerActiviteDepuisRdv =>
  async ({ utilisateurId, mediateurId, rdvId }) => {
    const [rdv, compte] = await Promise.all([
      lireRdv(rdvId),
      compteDuRedacteur(utilisateurId),
    ])

    const verifie = verifierRdv({ rdv, compte, rdvId })

    if (!verifie.success) {
      return verifie
    }

    const beneficiaires = await creerOuFusionnerBeneficiaires({
      usagers: usagersPourActivite(verifie.data),
      mediateurId,
    })

    return success({
      urlCreationCra: await preparerUrlCreationCra({
        rdvId,
        mediateurId,
        beneficiaires,
      }),
    })
  }
