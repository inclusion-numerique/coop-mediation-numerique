import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import type { BeneficiaireCraData } from '@app/web/features/activites/ui/saisie/validation/BeneficiaireCraValidation'
import type { DefaultValues } from 'react-hook-form'
import type { FicheDuBeneficiaireSuivi } from '../../domain'

export const getBeneficiaireDefaultCraDataFromExisting =
  ({
    notes,
    id,
    commune,
    adresse,
    anneeNaissance,
    communeCodeInsee,
    communeCodePostal,
    email,
    genre,
    nom,
    pasDeTelephone,
    prenom,
    statutSocial,
    telephone,
    trancheAge,
  }: FicheDuBeneficiaireSuivi) =>
  (
    premierAccompagnement?: boolean,
  ): DefaultValues<BeneficiaireCraData> & { id?: string } => ({
    id: id ?? undefined,
    communeResidence:
      commune && communeCodeInsee && communeCodePostal
        ? banDefaultValueToAdresseBanData({
            commune: commune ?? undefined,
            codePostal: communeCodePostal ?? undefined,
            codeInsee: communeCodeInsee ?? undefined,
          })
        : undefined,
    adresse: adresse ?? undefined,
    anneeNaissance: anneeNaissance ?? undefined,
    email: email ?? undefined,
    genre: genre ?? undefined,
    nom: nom ?? undefined,
    pasDeTelephone: pasDeTelephone ?? undefined,
    prenom: prenom ?? undefined,
    statutSocial: statutSocial ?? undefined,
    telephone: telephone ?? undefined,
    trancheAge: trancheAge ?? undefined,
    notes: notes ?? undefined,
    dejaAccompagne:
      premierAccompagnement == null ? undefined : !premierAccompagnement,
  })
