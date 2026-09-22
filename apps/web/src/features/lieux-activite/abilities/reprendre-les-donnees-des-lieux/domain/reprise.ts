import type { LieuAReprendre } from './lieu-a-reprendre'

export type Mention = {
  readonly colonne: string
  readonly cellule: string
  readonly motif: string
}

export type Constat = {
  readonly mentions: readonly Mention[]
  readonly appliquer: () => Promise<void>
}

export type Constater = (lieu: LieuAReprendre) => Constat | null

export type Reprise = {
  readonly colonnes: readonly string[]
  readonly preparer: (lieux: readonly LieuAReprendre[]) => Promise<Constater>
}

export type DefinitionDeReprise<Verdict> = {
  readonly colonnes: readonly string[]
  readonly constater: (lieu: LieuAReprendre) => Verdict | null
  readonly mentions: (verdict: Verdict) => readonly Mention[]
  readonly appliquer: (lieuId: string, verdict: Verdict) => Promise<void>
}

export type DefinitionAvecPrealable<Verdict, Prealable> = Omit<
  DefinitionDeReprise<Verdict>,
  'constater'
> & {
  readonly preparer: (lieux: readonly LieuAReprendre[]) => Promise<Prealable>
  readonly constater: (
    lieu: LieuAReprendre,
    prealable: Prealable,
  ) => Verdict | null
}

const constater =
  <Verdict>(
    { mentions, appliquer }: Omit<DefinitionDeReprise<Verdict>, 'constater'>,
    juger: (lieu: LieuAReprendre) => Verdict | null,
  ): Constater =>
  (lieu) => {
    const verdict = juger(lieu)

    return verdict == null
      ? null
      : {
          mentions: mentions(verdict),
          appliquer: () => appliquer(lieu.id, verdict),
        }
  }

export const reprise = <Verdict>(
  definition: DefinitionDeReprise<Verdict>,
): Reprise => ({
  colonnes: definition.colonnes,
  preparer: async () => constater(definition, definition.constater),
})

/**
 * Une reprise dont le jugement demande un travail préalable sur l'ensemble des
 * lieux : interroger un service en masse plutôt qu'un lieu à la fois. Le
 * préalable est calculé une seule fois, puis chaque lieu se juge devant lui.
 */
export const repriseAvecPrealable = <Verdict, Prealable>(
  definition: DefinitionAvecPrealable<Verdict, Prealable>,
): Reprise => ({
  colonnes: definition.colonnes,
  preparer: async (lieux) => {
    const prealable = await definition.preparer(lieux)

    return constater(definition, (lieu) =>
      definition.constater(lieu, prealable),
    )
  },
})
