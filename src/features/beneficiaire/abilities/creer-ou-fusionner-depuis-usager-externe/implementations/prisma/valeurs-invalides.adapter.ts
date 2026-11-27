import { signaler } from '@/configuration/telemetry/serveur'
import type { MergedBeneficiaire } from '../../domain/usager-externe'
import type { BeneficiaireFusionneLu } from './beneficiaire-fusionne.transfer'

export const valeursInvalidesEnErreurs = ({
  beneficiaire,
  invalides,
}: BeneficiaireFusionneLu): readonly Error[] =>
  invalides.map(
    (champ) =>
      new Error(
        `Bénéficiaire ${beneficiaire.id} : ${champ} invalide en base, lu comme absent pour la fusion`,
      ),
  )

export const signalerLesValeursInvalides = (
  lu: BeneficiaireFusionneLu,
): MergedBeneficiaire => {
  valeursInvalidesEnErreurs(lu).forEach(signaler)
  return lu.beneficiaire
}
