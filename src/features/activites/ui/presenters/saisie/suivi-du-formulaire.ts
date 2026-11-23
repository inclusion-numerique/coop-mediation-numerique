import type { BeneficiaireSuiviAffiche } from '../../../domain'
import type { BeneficiaireDuCra } from './beneficiaire-du-cra'
import { communeDuFormulaire } from './formulaire-de-mediation.presenter'

export const suiviDuFormulaire = ({
  id,
  prenom,
  nom,
  residence,
}: BeneficiaireSuiviAffiche): BeneficiaireDuCra => ({
  id,
  prenom,
  nom,
  communeResidence: residence === null ? null : communeDuFormulaire(residence),
})
