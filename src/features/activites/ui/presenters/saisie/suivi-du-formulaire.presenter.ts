import type { BeneficiaireSuiviAffiche } from '../../../domain/index'
import type { BeneficiaireDuCra } from './beneficiaire-du-cra.presenter'
import { communeDuFormulaire } from './formulaire-de-mediation.presenter'

export const suiviDuFormulaire = ({
  id,
  prenom,
  nom,
  residence,
}: BeneficiaireSuiviAffiche): BeneficiaireDuCra => ({
  id,
  prenom: prenom ?? '',
  nom: nom ?? '',
  communeResidence: residence === null ? null : communeDuFormulaire(residence),
})
