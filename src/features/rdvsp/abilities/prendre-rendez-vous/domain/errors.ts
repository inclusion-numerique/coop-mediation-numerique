import type { BeneficiaireCibleId } from './beneficiaire-cible'

/**
 * Le bénéficiaire n'existe pas, ou n'est pas suivi par ce médiateur. Les deux
 * cas partagent la même erreur, à l'inverse du rendez-vous : un identifiant de
 * bénéficiaire est un uuid, deviner celui d'un collègue n'a pas de sens, et
 * distinguer les deux ne renseignerait que sur l'existence d'un suivi ailleurs.
 */
export type BeneficiaireIntrouvable = {
  readonly _tag: 'BeneficiaireIntrouvable'
  readonly id: BeneficiaireCibleId
}

export const BeneficiaireIntrouvable = (
  id: BeneficiaireCibleId,
): BeneficiaireIntrouvable => ({ _tag: 'BeneficiaireIntrouvable', id })
