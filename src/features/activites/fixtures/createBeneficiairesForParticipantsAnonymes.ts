import type { ParticipantsAnonymesCraCollectifData } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/ParticipantsAnonymesCraCollectifValidation'
import { genres } from '@app/web/features/beneficiaire/domain/genre'
import { statutsSociaux } from '@app/web/features/beneficiaire/domain/statut-social'
import { tranchesAge } from '@app/web/features/beneficiaire/domain/tranche-age'
import type {
  Genre,
  Prisma,
  StatutSocial,
  TrancheAge,
} from '@app/web/generated/prisma/client'
import { v4 } from 'uuid'

export const createCounterUuid = (root: string, index: number): string =>
  root.slice(0, -5) + index.toString(10).padStart(5, '0')

type CreatedBeneficiairesForParticipantsAnonymes =
  Prisma.BeneficiaireUncheckedCreateInput & {
    id: string
    mediateurId: string
    trancheAge: TrancheAge
    statutSocial: StatutSocial
    genre: Genre
    anonyme: true
    attributionsAleatoires: true
    dejaAccompagne: boolean
  }

const repartis = <V extends string>(
  valeurs: readonly V[],
  effectifDe: (valeur: V) => number,
): readonly V[] =>
  valeurs.flatMap((valeur) =>
    Array.from({ length: Math.max(effectifDe(valeur), 0) }, () => valeur),
  )

export const createBeneficiairesForParticipantsAnonymes = ({
  participantsAnonymes,
  rootUuid = v4(),
  mediateurId,
}: {
  participantsAnonymes: ParticipantsAnonymesCraCollectifData
  rootUuid?: string
  mediateurId: string
}): CreatedBeneficiairesForParticipantsAnonymes[] => {
  const parGenre = repartis(
    genres,
    (genre) => participantsAnonymes[`genre${genre}`],
  )
  const parStatutSocial = repartis(
    statutsSociaux,
    (statutSocial) => participantsAnonymes[`statutSocial${statutSocial}`],
  )
  const parTrancheAge = repartis(
    tranchesAge,
    (trancheAge) => participantsAnonymes[`trancheAge${trancheAge}`],
  )

  return Array.from(
    { length: Math.max(participantsAnonymes.total, 0) },
    (_, index) => ({
      id: createCounterUuid(rootUuid, index),
      mediateurId,
      anonyme: true,
      attributionsAleatoires: true,
      trancheAge: parTrancheAge[index] ?? 'NonCommunique',
      statutSocial: parStatutSocial[index] ?? 'NonCommunique',
      genre: parGenre[index] ?? 'NonCommunique',
      dejaAccompagne: index < participantsAnonymes.dejaAccompagne,
    }),
  )
}
