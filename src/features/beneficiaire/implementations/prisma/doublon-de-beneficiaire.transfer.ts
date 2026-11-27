import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { DuplicateBeneficiaire } from '@/features/beneficiaire/domain/doublon-de-beneficiaire'
import { Email } from '@/features/beneficiaire/domain/email'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { Telephone } from '@/libraries/telephone'

export type LigneDeDoublon = {
  readonly id: string
  readonly nom: string | null
  readonly prenom: string | null
  readonly telephone: string | null
  readonly email: string | null
  readonly creation: Date
  readonly anneeNaissance: number | null
  readonly adresse: string | null
  readonly commune: string | null
  readonly communeCodePostal: string | null
  readonly communeCodeInsee: string | null
}

export type DoublonLu = {
  readonly doublon: DuplicateBeneficiaire | null
  readonly invalides: readonly string[]
}

const decode = <Brut, Decode>(
  brut: Brut | null,
  safe: (valeur: Brut) => Decode | null,
): Decode | null => (brut === null ? null : safe(brut))

const communeResidence = (ligne: LigneDeDoublon): CommuneResidence | null =>
  ligne.commune && ligne.communeCodePostal && ligne.communeCodeInsee
    ? CommuneResidence.safe({
        commune: ligne.commune,
        codePostal: ligne.communeCodePostal,
        codeInsee: ligne.communeCodeInsee,
        ...(ligne.adresse ? { adresse: ligne.adresse } : {}),
      })
    : null

export const doublonLu = (
  ligne: LigneDeDoublon,
  maintenant: Date,
): DoublonLu => {
  const id = BeneficiaireId.safe(ligne.id)
  if (id === null) return { doublon: null, invalides: ['id'] }
  const doublon: DuplicateBeneficiaire = {
    id,
    nom: decode(ligne.nom, Nom.safe),
    prenom: decode(ligne.prenom, Prenom.safe),
    telephone: decode(ligne.telephone, Telephone.safe),
    email: decode(ligne.email, Email.safe),
    creation: ligne.creation,
    anneeNaissance: decode(
      ligne.anneeNaissance,
      AnneeNaissance(maintenant).safe,
    ),
    communeResidence: communeResidence(ligne),
  }
  return {
    doublon,
    invalides: (
      ['nom', 'prenom', 'telephone', 'email', 'anneeNaissance'] as const
    ).filter((champ) => ligne[champ] !== null && doublon[champ] === null),
  }
}

export const valeurInvalideDuDoublonEnErreur =
  (id: string) =>
  (champ: string): Error =>
    new Error(
      `Bénéficiaire ${id} : ${champ} invalide en base, ignoré pour la détection des doublons`,
    )
