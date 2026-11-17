import type { BeneficiaireSuiviAffiche } from '../../../domain'
import { communeDuFormulaire } from '../formulaire-de-mediation.presenter'
import type { BeneficiaireDuCra } from './beneficiaire-du-cra'

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
