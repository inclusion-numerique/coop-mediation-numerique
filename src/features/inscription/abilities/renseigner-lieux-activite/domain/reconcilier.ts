export type LieuActiviteExistant = {
  readonly id: string
  readonly lieuInclusion: {
    readonly id: string
    readonly structureCartographieNationaleId: string | null
  }
}

export type AdresseValidee = {
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
  readonly banId: string
  readonly latitude: number
  readonly longitude: number
}

type Identite = {
  readonly nom: string
  readonly siret?: string | null
  readonly structureCartographieNationaleId?: string | null
}

type LieuActiviteConnu = Identite & {
  readonly id: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee?: string | null
}

type LieuActiviteACreer = Identite & AdresseValidee & { readonly id?: null }

export type LieuActiviteInput = LieuActiviteConnu | LieuActiviteACreer

export type Reconciliation = {
  readonly aCloturer: readonly string[]
  readonly aCreer: readonly LieuActiviteInput[]
}

const estDefini = (valeur?: string | null): valeur is string => valeur != null

const identite = ({
  id,
  structureCartographieNationaleId,
  nom,
}: LieuActiviteInput): string =>
  estDefini(id)
    ? `id:${id}`
    : estDefini(structureCartographieNationaleId)
      ? `carto:${structureCartographieNationaleId}`
      : `nom:${nom}`

const premiereOccurrence = (
  desire: LieuActiviteInput,
  index: number,
  desires: readonly LieuActiviteInput[],
): boolean =>
  desires.findIndex((autre) => identite(autre) === identite(desire)) === index

export const reconcilierLieuxActivite = (
  existants: readonly LieuActiviteExistant[],
  desires: readonly LieuActiviteInput[],
): Reconciliation => {
  const idsDesires = desires.map(({ id }) => id).filter(estDefini)
  const cartoIdsDesires = desires
    .map(
      ({ structureCartographieNationaleId }) =>
        structureCartographieNationaleId,
    )
    .filter(estDefini)

  const estDesire = ({ lieuInclusion }: LieuActiviteExistant) =>
    idsDesires.includes(lieuInclusion.id) ||
    (estDefini(lieuInclusion.structureCartographieNationaleId) &&
      cartoIdsDesires.includes(lieuInclusion.structureCartographieNationaleId))

  const idsLieuxExistants = existants.map(
    ({ lieuInclusion }) => lieuInclusion.id,
  )
  const cartoIdsLieuxExistants = existants
    .map(({ lieuInclusion }) => lieuInclusion.structureCartographieNationaleId)
    .filter(estDefini)

  const estDejaRattache = ({
    id,
    structureCartographieNationaleId,
  }: LieuActiviteInput) =>
    (estDefini(id) && idsLieuxExistants.includes(id)) ||
    (estDefini(structureCartographieNationaleId) &&
      cartoIdsLieuxExistants.includes(structureCartographieNationaleId))

  return {
    aCloturer: existants
      .filter((existant) => !estDesire(existant))
      .map(({ id }) => id),
    aCreer: desires
      .filter((desire) => !estDejaRattache(desire))
      .filter(premiereOccurrence),
  }
}
