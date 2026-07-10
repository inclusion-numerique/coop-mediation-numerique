import { scoredCommuneFieldsFromAddress } from '@app/web/external-apis/ban/communeFieldsFromAddress'
import {
  beneficiaireFromDomain,
  beneficiaireToDomain,
} from '@app/web/features/beneficiaire/db'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { prismaClient } from '@app/web/prismaClient'
import { chunk } from 'lodash-es'
import type {
  NormaliserBeneficiaireChange,
  NormaliserBeneficiaireError,
  NormaliserBeneficiaires,
} from '../../domain/normaliser-beneficiaires'
import { emailAbsent, repairEmail } from '../../domain/repair-email'
import {
  repairTelephone,
  telephonePlaceholder,
} from '../../domain/repair-telephone'

const BATCH_SIZE = 100
const MAX_REPORTED_ERRORS = 100
// Confiance minimale du géocodage BAN pour remplir une commune incomplète.
const COMMUNE_SCORE_MIN = 0.9

type BeneficiaireRow = Awaited<
  ReturnType<typeof prismaClient.beneficiaire.findMany>
>[number]

type Normalized = Omit<ReturnType<typeof beneficiaireFromDomain>, 'id'>

type OkOutcome = {
  status: 'ok'
  row: BeneficiaireRow
  normalized: Normalized
}

type InvalidOutcome = {
  status: 'invalid'
  error: NormaliserBeneficiaireError
}

// Téléphone / email à stocker : réparé si possible ; sinon vidé (`null`) si la
// valeur est un placeholder (« 0000000000 », « A créer », « pas d'email »…) ou
// n'a aucun caractère alphanumérique (« - », « / »… = purement séparateurs) ;
// sinon laissée telle quelle (la fiche sera sautée et remontée dans les
// erreurs, y compris un texte égaré que l'on ne veut pas détruire).
const irrecuperableToStore = (raw: string): string | null =>
  /[a-z0-9]/i.test(raw) ? raw : null

const telephoneToStore = (raw: string): string | null =>
  repairTelephone(raw) ??
  (telephonePlaceholder(raw) ? null : irrecuperableToStore(raw))

const emailToStore = (raw: string): string | null =>
  repairEmail(raw) ?? (emailAbsent(raw) ? null : irrecuperableToStore(raw))

const communeComplete = (fields: Normalized): boolean =>
  fields.commune !== null &&
  fields.communeCodePostal !== null &&
  fields.communeCodeInsee !== null

// Re-canonicalise une fiche via le transfer layer (téléphone et email
// pré-réparés). `modification` est réémis pour que l'extension timestamp ne
// bumpe pas (un nettoyage de données n'est pas une édition). Une donnée
// invalide fait throw toDomain → la fiche est remontée dans les erreurs.
const recanonicalise = (row: BeneficiaireRow): OkOutcome | InvalidOutcome => {
  try {
    const prepared = {
      ...row,
      ...(row.telephone === null
        ? {}
        : { telephone: telephoneToStore(row.telephone) }),
      ...(row.email === null ? {} : { email: emailToStore(row.email) }),
    }
    const { id: _id, ...rest } = beneficiaireFromDomain(
      beneficiaireToDomain(prepared),
    )
    // Le round-trip du domaine ne sait pas représenter une commune INCOMPLÈTE
    // (trio commune/CP/INSEE partiel) : il la réduit à `null` et efface au
    // passage l'adresse texte. Normaliser ne doit RIEN supprimer → si le
    // round-trip nullifie une colonne de résidence, on restitue la valeur
    // d'origine (`?? row`) ; une commune COMPLÈTE reste canonicalisée (ex. CP
    // « 75 001 » → « 75001 »). Le remplissage d'un partiel se fait ensuite par
    // géocodage (cf. `withGeocodedCommune`).
    const normalized: Normalized = {
      ...rest,
      adresse: rest.adresse ?? row.adresse,
      commune: rest.commune ?? row.commune,
      communeCodePostal: rest.communeCodePostal ?? row.communeCodePostal,
      communeCodeInsee: rest.communeCodeInsee ?? row.communeCodeInsee,
    }
    return { status: 'ok', row, normalized }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'erreur inconnue'
    // La validation email marque `"validation": "email"` ; le téléphone est le
    // seul champ à lever une issue `"code": "custom"` (cf. value object).
    const champ = reason.includes('"validation": "email"')
      ? 'email'
      : reason.includes('"code": "custom"')
        ? 'telephone'
        : 'autre'
    const valeur =
      champ === 'email'
        ? row.email
        : champ === 'telephone'
          ? row.telephone
          : null
    return {
      status: 'invalid',
      error: {
        id: BeneficiaireId(row.id),
        champ,
        valeur,
        reason,
      } satisfies NormaliserBeneficiaireError,
    }
  }
}

// Commune INCOMPLÈTE + adresse renseignée → on géocode l'adresse et on remplit
// le trio commune/CP/INSEE si la BAN matche avec assez de confiance ; sinon on
// préserve le partiel (jamais d'effacement). Une commune déjà complète ou sans
// adresse n'appelle pas la BAN.
const withGeocodedCommune = async (
  normalized: Normalized,
): Promise<Normalized> => {
  if (communeComplete(normalized) || normalized.adresse === null)
    return normalized

  // Un échec BAN (réseau, quota) ne doit pas avorter la normalisation : on
  // préserve alors le partiel tel quel.
  const scored = await scoredCommuneFieldsFromAddress(normalized.adresse).catch(
    () => null,
  )
  return scored && scored.score > COMMUNE_SCORE_MIN
    ? {
        ...normalized,
        commune: scored.commune,
        communeCodePostal: scored.communeCodePostal,
        communeCodeInsee: scored.communeCodeInsee,
      }
    : normalized
}

const needsGeocoding = ({ normalized }: OkOutcome): boolean =>
  !communeComplete(normalized) && normalized.adresse !== null

// Ne retient que les fiches réellement modifiées, avec leur diff (téléphone,
// email, commune) pour le rapport CSV.
const toUpdate = ({ row, normalized }: OkOutcome) => {
  const champsModifies = Object.entries(normalized)
    .filter(([key, value]) => value !== (row as Record<string, unknown>)[key])
    .map(([key]) => key)
  return champsModifies.length > 0
    ? [
        {
          id: row.id,
          data: { ...normalized, modification: row.modification },
          change: {
            id: BeneficiaireId(row.id),
            telephoneAvant: row.telephone,
            telephoneApres: normalized.telephone ?? null,
            emailAvant: row.email,
            emailApres: normalized.email ?? null,
            communeAvant: row.commune,
            communeApres: normalized.commune ?? null,
            adresseAvant: row.adresse,
            adresseApres: normalized.adresse ?? null,
            champsModifies,
          } satisfies NormaliserBeneficiaireChange,
        },
      ]
    : []
}

export const normaliserBeneficiaires: NormaliserBeneficiaires = async ({
  dryRun = true,
} = {}) => {
  const rows = await prismaClient.beneficiaire.findMany({
    where: { anonyme: false },
  })

  const outcomes = rows.map(recanonicalise)

  const errors = outcomes.flatMap((outcome) =>
    outcome.status === 'invalid' ? [outcome.error] : [],
  )
  const oks = outcomes.flatMap((outcome) =>
    outcome.status === 'ok' ? [outcome] : [],
  )

  // Seules les communes incomplètes appellent la BAN ; le reste ne fait aucun
  // I/O réseau. Géocodage séquentiel (doux pour l'API).
  const geocoded = await oks
    .filter(needsGeocoding)
    .reduce<Promise<OkOutcome[]>>(
      (previous, outcome) =>
        previous.then(async (list) => [
          ...list,
          {
            ...outcome,
            normalized: await withGeocodedCommune(outcome.normalized),
          },
        ]),
      Promise.resolve([]),
    )

  const aMettreAJour = [
    ...oks.filter((outcome) => !needsGeocoding(outcome)),
    ...geocoded,
  ].flatMap(toUpdate)

  // Écritures uniquement hors dry-run ; le dry-run se contente de rapporter.
  await (dryRun
    ? Promise.resolve()
    : chunk(aMettreAJour, BATCH_SIZE).reduce(
        (previous, batch) =>
          previous.then(async () => {
            await Promise.all(
              batch.map(({ id, data }) =>
                prismaClient.beneficiaire.update({ where: { id }, data }),
              ),
            )
          }),
        Promise.resolve(),
      ))

  return {
    dryRun,
    updated: aMettreAJour.length,
    skipped: errors.length,
    errors: errors.slice(0, MAX_REPORTED_ERRORS),
    changes: aMettreAJour.map((outcome) => outcome.change),
  }
}
