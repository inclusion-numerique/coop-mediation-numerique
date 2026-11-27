import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { Email } from '@/features/beneficiaire/domain/email'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { NOM_MAX_LENGTH, Nom } from '@/features/beneficiaire/domain/nom'
import {
  PRENOM_MAX_LENGTH,
  Prenom,
} from '@/features/beneficiaire/domain/prenom'
import { Telephone } from '@/libraries/telephone'
import type { RdvUserId } from '../../domain/rdv-user-id'
import type { UsagerNormalise } from '../../domain/usager-externe'

export type UsagerExterneAFusionner = {
  readonly rdvUserId: RdvUserId
  readonly nom: string | null
  readonly prenom: string | null
  readonly telephone: string | null
  readonly email: string | null
  readonly adresse: string | null
  readonly birthDate: Date | null
}

export type DemandeDUsagersExternes = {
  readonly usagers: readonly UsagerExterneAFusionner[]
  readonly mediateurId: MediateurId
  readonly maintenant: Date
}

const ANNEE_DE_NAISSANCE_ABSENTE_DE_RDVSP = 1900

const tronque = (valeur: string, longueurMax: number): string =>
  valeur.trim().slice(0, longueurMax)

const anneeDeNaissance = (
  birthDate: Date | null,
  maintenant: Date,
): AnneeNaissance | null => {
  const annee = birthDate?.getFullYear()
  return annee && annee > ANNEE_DE_NAISSANCE_ABSENTE_DE_RDVSP
    ? AnneeNaissance(maintenant).safe(annee)
    : null
}

const usagerNormalise =
  (maintenant: Date) =>
  (usager: UsagerExterneAFusionner): UsagerNormalise => ({
    rdvUserId: usager.rdvUserId,
    nom: usager.nom ? Nom.safe(tronque(usager.nom, NOM_MAX_LENGTH)) : null,
    prenom: usager.prenom
      ? Prenom.safe(tronque(usager.prenom, PRENOM_MAX_LENGTH))
      : null,
    telephone: usager.telephone ? Telephone.safe(usager.telephone) : null,
    email: usager.email ? Email.safe(usager.email) : null,
    adresse: usager.adresse,
    anneeNaissance: anneeDeNaissance(usager.birthDate, maintenant),
  })

export const demandeNormalisee = ({
  usagers,
  mediateurId,
  maintenant,
}: DemandeDUsagersExternes) => ({
  usagers: usagers.map(usagerNormalise(maintenant)),
  mediateurId,
  maintenant,
})

export type ValeurInvalideDeRdvsp = {
  readonly rdvUserId: RdvUserId
  readonly champ: 'nom' | 'prenom' | 'telephone' | 'email' | 'anneeNaissance'
}

const anneeFournie = (birthDate: Date | null): boolean =>
  birthDate !== null &&
  birthDate.getFullYear() > ANNEE_DE_NAISSANCE_ABSENTE_DE_RDVSP

const valeursInvalidesDeLUsager =
  (maintenant: Date) =>
  (usager: UsagerExterneAFusionner): readonly ValeurInvalideDeRdvsp[] => {
    const normalise = usagerNormalise(maintenant)(usager)
    const fournis = {
      nom: Boolean(usager.nom),
      prenom: Boolean(usager.prenom),
      telephone: Boolean(usager.telephone),
      email: Boolean(usager.email),
      anneeNaissance: anneeFournie(usager.birthDate),
    }
    return (['nom', 'prenom', 'telephone', 'email', 'anneeNaissance'] as const)
      .filter((champ) => fournis[champ] && normalise[champ] === null)
      .map((champ) => ({ rdvUserId: usager.rdvUserId, champ }))
  }

export const valeursInvalidesDeLaDemande = ({
  usagers,
  maintenant,
}: DemandeDUsagersExternes): readonly ValeurInvalideDeRdvsp[] =>
  usagers.flatMap(valeursInvalidesDeLUsager(maintenant))
