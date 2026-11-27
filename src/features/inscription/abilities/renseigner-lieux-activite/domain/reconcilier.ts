import type { LieuId } from '@/features/inscription/domain'
import type { IdentifiantCartographie } from './identifiant-cartographie'
import type { LieuDesire } from './lieu-soumis'
import type { RattachementId } from './rattachement-id'

export type LieuActiviteExistant = {
  readonly id: RattachementId
  readonly lieuInclusion: {
    readonly id: LieuId
    readonly structureCartographieNationaleId: IdentifiantCartographie | null
  }
}

export type Reconciliation<Adresse> = {
  readonly aCloturer: readonly RattachementId[]
  readonly aCreer: readonly LieuDesire<Adresse>[]
}

const estDefini = <T>(valeur: T | null): valeur is T => valeur !== null

const identifiantInterne = <Adresse>(
  lieu: LieuDesire<Adresse>,
): LieuId | null => (lieu._tag === 'LieuConnu' ? lieu.id : null)

const identite = <Adresse>(lieu: LieuDesire<Adresse>): string => {
  const id = identifiantInterne(lieu)

  if (id !== null) return `id:${id}`

  return lieu.structureCartographieNationaleId === null
    ? `nom:${lieu.nom}`
    : `carto:${lieu.structureCartographieNationaleId}`
}

const premiereOccurrence = <Adresse>(
  desire: LieuDesire<Adresse>,
  index: number,
  desires: readonly LieuDesire<Adresse>[],
): boolean =>
  desires.findIndex((autre) => identite(autre) === identite(desire)) === index

export const reconcilierLieuxActivite = <Adresse>(
  existants: readonly LieuActiviteExistant[],
  desires: readonly LieuDesire<Adresse>[],
): Reconciliation<Adresse> => {
  const idsDesires = desires.map(identifiantInterne).filter(estDefini)
  const cartoIdsDesires = desires
    .map(
      ({ structureCartographieNationaleId }) =>
        structureCartographieNationaleId,
    )
    .filter(estDefini)

  const estDesire = ({ lieuInclusion }: LieuActiviteExistant) =>
    idsDesires.includes(lieuInclusion.id) ||
    (lieuInclusion.structureCartographieNationaleId !== null &&
      cartoIdsDesires.includes(lieuInclusion.structureCartographieNationaleId))

  const idsLieuxExistants = existants.map(
    ({ lieuInclusion }) => lieuInclusion.id,
  )
  const cartoIdsLieuxExistants = existants
    .map(({ lieuInclusion }) => lieuInclusion.structureCartographieNationaleId)
    .filter(estDefini)

  const estDejaRattache = (desire: LieuDesire<Adresse>) => {
    const id = identifiantInterne(desire)

    return (
      (id !== null && idsLieuxExistants.includes(id)) ||
      (desire.structureCartographieNationaleId !== null &&
        cartoIdsLieuxExistants.includes(
          desire.structureCartographieNationaleId,
        ))
    )
  }

  return {
    aCloturer: existants
      .filter((existant) => !estDesire(existant))
      .map(({ id }) => id),
    aCreer: desires
      .filter((desire) => !estDejaRattache(desire))
      .filter(premiereOccurrence),
  }
}
