import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import type { DuplicateBeneficiaire } from '@/features/beneficiaire/domain/doublon-de-beneficiaire'
import { Email } from '@/features/beneficiaire/domain/email'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { NOM_MAX_LENGTH, Nom } from '@/features/beneficiaire/domain/nom'
import {
  PRENOM_MAX_LENGTH,
  Prenom,
} from '@/features/beneficiaire/domain/prenom'
import { effectiveTrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { findDuplicatesForBeneficiaire } from '@/features/beneficiaire/implementations/prisma/find-duplicates-for-beneficiaire.query'
import type { Prisma } from '@/generated/prisma/client'
import { siIndisponible } from '@/libraries/ban'
import { Telephone } from '@/libraries/telephone'
import type {
  CommuneFields,
  CreerOuFusionnerBeneficiairesDepuisUsagersExternes,
  MergedBeneficiaire,
  UsagerExterneAFusionner,
} from '../../domain/creer-ou-fusionner-depuis-usager-externe'

export type ServicesDuBeneficiaireExterne = {
  readonly communeDeLAdresse: (adresse: string) => Promise<CommuneFields | null>
}

const mergedBeneficiaireSelect = {
  id: true,
  prenom: true,
  nom: true,
  email: true,
  telephone: true,
  mediateurId: true,
  adresse: true,
  anneeNaissance: true,
  commune: true,
} satisfies Prisma.BeneficiaireSelect

// Usager externe canonicalisé LE PLUS TÔT POSSIBLE (à l'entrée du port) : chaque
// champ passe par son smart constructor `.safe` → forme canonique (téléphone
// E.164, email trim/minuscules, nom/prénom trimmés) ou `null` si non
// normalisable. La MÊME valeur sert à la déduplication, à la création ET à la
// fusion → la donnée stockée est identique à la clé de rapprochement, ce qui
// maximise la détection des doublons.
//
// L'adresse fait exception : elle est recopiée telle quelle, même quand la BAN
// ne rend pas de commune. Le domaine ne sait représenter qu'une résidence
// complète, mais la conserver vaut mieux que la perdre — l'outil de normalisation de l'administration
// la préserve et la géocode ensuite.
type NormalizedExternalUser = {
  rdvUserId: number
  nom: Nom | null
  prenom: Prenom | null
  telephone: Telephone | null
  email: Email | null
  adresse: string | null
  anneeNaissance: AnneeNaissance | null
}

/**
 * Un nom qui dépasse la longueur admise est une saisie parasite, pas une raison
 * d'écarter l'usager : on tronque avant de valider, le rapprochement comptant
 * plus que les caractères en trop.
 */
const tronque = (valeur: string, longueurMax: number): string =>
  valeur.trim().slice(0, longueurMax)

/**
 * RDVSP envoie `1900-01-01` quand la date de naissance est absente : c'est une
 * sentinelle, pas une année exploitable. Le reste est arbitré par le value
 * object lui-même — une année hors bornes (une saisie dans le futur) ne doit
 * pas entrer, puisque la lecture du bénéficiaire la refuserait.
 */
const anneeNaissanceFromBirthDate = (
  birthDate: Date | null,
): AnneeNaissance | null => {
  const year = birthDate?.getFullYear()
  return year && year > 1900 ? AnneeNaissance(new Date()).safe(year) : null
}

const normalizeExternalUser = (
  usager: UsagerExterneAFusionner,
): NormalizedExternalUser => ({
  rdvUserId: usager.rdvUserId,
  nom: usager.nom ? Nom.safe(tronque(usager.nom, NOM_MAX_LENGTH)) : null,
  prenom: usager.prenom
    ? Prenom.safe(tronque(usager.prenom, PRENOM_MAX_LENGTH))
    : null,
  telephone: usager.telephone ? Telephone.safe(usager.telephone) : null,
  email: usager.email ? Email.safe(usager.email) : null,
  adresse: usager.adresse,
  anneeNaissance: anneeNaissanceFromBirthDate(usager.birthDate),
})

type BeneficiaireToMerge = MergedBeneficiaire | DuplicateBeneficiaire

const existingCommune = (existing: BeneficiaireToMerge): unknown =>
  'commune' in existing ? existing.commune : existing.communeResidence

const findDuplicate = async (
  usager: NormalizedExternalUser,
  mediateurId: string,
): Promise<DuplicateBeneficiaire | null> => {
  const duplicates = await findDuplicatesForBeneficiaire({
    beneficiaire: {
      id: null,
      nom: usager.nom,
      prenom: usager.prenom,
      telephone: usager.telephone,
      email: usager.email,
      mediateurId: MediateurId(mediateurId),
    },
    withConflictingFields: 'exclude',
  })
  return duplicates.at(0) ?? null
}

// Ne complète que les champs manquants de la fiche existante (jamais d'écrasement
// d'une valeur déjà présente). Le géocodage n'est tenté que si la commune manque.
const mergeUpdateData = async (
  services: ServicesDuBeneficiaireExterne,
  usager: NormalizedExternalUser,
  existing: BeneficiaireToMerge,
  alreadyLinked: boolean,
): Promise<Prisma.BeneficiaireUncheckedUpdateInput> => {
  const communeFields =
    usager.adresse && !existingCommune(existing)
      ? await services
          .communeDeLAdresse(usager.adresse)
          .catch(siIndisponible(null))
      : null

  return {
    ...(alreadyLinked ? {} : { rdvUserId: usager.rdvUserId }),
    ...(usager.email && !existing.email ? { email: usager.email } : {}),
    ...(usager.telephone && !existing.telephone
      ? { telephone: usager.telephone }
      : {}),
    ...(usager.prenom && !existing.prenom ? { prenom: usager.prenom } : {}),
    ...(usager.nom && !existing.nom ? { nom: usager.nom } : {}),
    ...(usager.adresse &&
    !('communeResidence' in existing && existing.communeResidence)
      ? { adresse: usager.adresse }
      : {}),
    ...(usager.anneeNaissance && !existing.anneeNaissance
      ? {
          anneeNaissance: usager.anneeNaissance,
          trancheAge: effectiveTrancheAge(
            usager.anneeNaissance,
            null,
            new Date(),
          ),
        }
      : {}),
    ...(communeFields
      ? {
          commune: communeFields.commune,
          communeCodePostal: communeFields.communeCodePostal,
          communeCodeInsee: communeFields.communeCodeInsee,
        }
      : {}),
  }
}

/**
 * Une fiche identifiée sans nom ni prénom est illisible : la liste et la
 * recherche du médiateur valident `Prenom(row.prenom ?? '')`, et une seule fiche
 * ainsi écrite ferait tomber la page entière. Mieux vaut écarter l'usager — le
 * lot en fait un `Skipped` observable — que d'écrire ce que le modèle de lecture
 * refusera.
 */
const identiteRequise = (usager: NormalizedExternalUser): void => {
  if (usager.nom === null || usager.prenom === null) {
    throw new Error(
      `usager rdv ${usager.rdvUserId} : nom et prénom sont requis pour une fiche identifiée`,
    )
  }
}

const createBeneficiaire = async (
  services: ServicesDuBeneficiaireExterne,
  usager: NormalizedExternalUser,
  mediateurId: string,
): Promise<MergedBeneficiaire> => {
  identiteRequise(usager)

  const communeFields = usager.adresse
    ? await services
        .communeDeLAdresse(usager.adresse)
        .catch(siIndisponible(null))
    : null

  return prismaClient.beneficiaire.create({
    data: {
      id: v4(),
      rdvUserId: usager.rdvUserId,
      nom: usager.nom,
      prenom: usager.prenom,
      telephone: usager.telephone,
      email: usager.email,
      adresse: usager.adresse,
      anneeNaissance: usager.anneeNaissance,
      trancheAge: effectiveTrancheAge(usager.anneeNaissance, null, new Date()),
      commune: communeFields?.commune ?? null,
      communeCodePostal: communeFields?.communeCodePostal ?? null,
      communeCodeInsee: communeFields?.communeCodeInsee ?? null,
      mediateurId,
      anonyme: false,
    },
    select: mergedBeneficiaireSelect,
  })
}

// Un usager → un bénéficiaire (lié, fusionné sur doublon, ou créé). Peut jeter
// sur une erreur d'infra (Prisma, géocodage) ou sur une identité inexploitable
// à la création — dans les deux cas, l'isolation par usager au
// niveau du lot transforme ces throws en `Skipped` sans bloquer les autres.
const mergeOneUsager = async (
  services: ServicesDuBeneficiaireExterne,
  usager: UsagerExterneAFusionner,
  mediateurId: string,
): Promise<MergedBeneficiaire> => {
  const normalized = normalizeExternalUser(usager)

  const linked = await prismaClient.beneficiaire.findFirst({
    where: {
      rdvUserId: normalized.rdvUserId,
      mediateurId,
      suppression: null,
      anonyme: false,
    },
    select: mergedBeneficiaireSelect,
  })

  if (linked) {
    const data = await mergeUpdateData(services, normalized, linked, true)
    return Object.keys(data).length > 0
      ? prismaClient.beneficiaire.update({
          where: { id: linked.id },
          data,
          select: mergedBeneficiaireSelect,
        })
      : linked
  }

  const duplicate = await findDuplicate(normalized, mediateurId)
  if (duplicate) {
    // La liaison rdvUserId est toujours ajoutée → mise à jour garantie.
    const data = await mergeUpdateData(services, normalized, duplicate, false)
    return prismaClient.beneficiaire.update({
      where: { id: duplicate.id },
      data,
      select: mergedBeneficiaireSelect,
    })
  }

  return createBeneficiaire(services, normalized, mediateurId)
}

export const creerOuFusionnerBeneficiairesDepuisUsagersExternes =
  (
    services: ServicesDuBeneficiaireExterne,
  ): CreerOuFusionnerBeneficiairesDepuisUsagersExternes =>
  async ({ usagers, mediateurId }) => {
    const outcomes = await Promise.all(
      usagers.map((usager) =>
        mergeOneUsager(services, usager, mediateurId)
          .then((beneficiaire) => ({ _tag: 'Merged' as const, beneficiaire }))
          .catch((reason) => {
            // biome-ignore lint/suspicious/noConsole: observabilité d'un usager écarté (erreur d'infra), sans bloquer le lot
            console.warn(
              `[creer-ou-fusionner-usager-externe] usager rdv ${usager.rdvUserId} écarté`,
              reason,
            )
            return {
              _tag: 'Skipped' as const,
              rdvUserId: usager.rdvUserId,
              reason,
            }
          }),
      ),
    )

    return {
      merges: outcomes.flatMap((outcome) =>
        outcome._tag === 'Merged' ? [outcome.beneficiaire] : [],
      ),
      skipped: outcomes.flatMap((outcome) =>
        outcome._tag === 'Skipped'
          ? [{ rdvUserId: outcome.rdvUserId, reason: outcome.reason }]
          : [],
      ),
    }
  }
