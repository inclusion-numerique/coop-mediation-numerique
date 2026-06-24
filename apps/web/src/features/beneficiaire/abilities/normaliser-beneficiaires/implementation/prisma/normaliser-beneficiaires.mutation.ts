import {
  beneficiaireFromDomain,
  beneficiaireToDomain,
} from '@app/web/features/beneficiaire/db'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import { prismaClient } from '@app/web/prismaClient'
import { chunk } from 'lodash-es'
import type {
  NormaliserBeneficiaireError,
  NormaliserBeneficiaires,
} from '../../domain/normaliser-beneficiaires'

const BATCH_SIZE = 100
const MAX_REPORTED_ERRORS = 100

type BeneficiaireRow = Awaited<
  ReturnType<typeof prismaClient.beneficiaire.findMany>
>[number]

const tryTelephone = (value: string): string | null => {
  try {
    return Telephone(value)
  } catch {
    return null
  }
}

// Téléphone canonique avec réparation légère (backfill only — le VO live reste
// strict). Candidats essayés dans l'ordre : tel quel ; le 1er numéro (champs
// multi-numéros séparés par retour à la ligne ou « / ») compacté (espaces et
// séparateurs parasites) ; puis avec un 0 de tête (numéro à 9 chiffres saisi
// sans son 0 — ~93 % des invalides). null si irrécupérable.
const toCanonicalTelephone = (raw: string): string | null => {
  const first = raw.split(/[\r\n/]+/)[0] ?? raw
  const compact = first.replace(/[^\d+]/g, '')
  const digits = first.replace(/\D/g, '')
  const candidates =
    digits.length === 9 ? [raw, compact, `0${digits}`] : [raw, compact]
  return candidates.reduce<string | null>(
    (found, candidate) => found ?? tryTelephone(candidate),
    null,
  )
}

// Re-canonicalise une fiche via le transfer layer (téléphone pré-réparé).
// `modification` est réémis pour que l'extension timestamp ne bumpe pas (un
// nettoyage de données n'est pas une édition). Une donnée invalide fait throw
// toDomain → la fiche est remontée dans les erreurs.
const recanonicalise = (row: BeneficiaireRow) => {
  try {
    const prepared =
      row.telephone === null
        ? row
        : {
            ...row,
            telephone: toCanonicalTelephone(row.telephone) ?? row.telephone,
          }
    const { id: _id, ...rest } = beneficiaireFromDomain(
      beneficiaireToDomain(prepared),
    )
    const changed = Object.entries(rest).some(
      ([key, value]) => value !== (row as Record<string, unknown>)[key],
    )
    return changed
      ? {
          status: 'changed' as const,
          id: row.id,
          data: { ...rest, modification: row.modification },
        }
      : { status: 'unchanged' as const }
  } catch (error) {
    return {
      status: 'invalid' as const,
      error: {
        id: BeneficiaireId(row.id),
        reason: error instanceof Error ? error.message : 'erreur inconnue',
      } satisfies NormaliserBeneficiaireError,
    }
  }
}

export const normaliserBeneficiaires: NormaliserBeneficiaires = async () => {
  const rows = await prismaClient.beneficiaire.findMany({
    where: { anonyme: false },
  })

  const outcomes = rows.map(recanonicalise)

  const errors = outcomes.flatMap((outcome) =>
    outcome.status === 'invalid' ? [outcome.error] : [],
  )

  const aMettreAJour = outcomes.flatMap((outcome) =>
    outcome.status === 'changed'
      ? [{ id: outcome.id, data: outcome.data }]
      : [],
  )

  await chunk(aMettreAJour, BATCH_SIZE).reduce(
    (previous, batch) =>
      previous.then(async () => {
        await Promise.all(
          batch.map(({ id, data }) =>
            prismaClient.beneficiaire.update({ where: { id }, data }),
          ),
        )
      }),
    Promise.resolve(),
  )

  return {
    updated: aMettreAJour.length,
    skipped: errors.length,
    errors: errors.slice(0, MAX_REPORTED_ERRORS),
  }
}
