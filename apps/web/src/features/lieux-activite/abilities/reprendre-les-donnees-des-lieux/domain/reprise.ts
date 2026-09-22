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

export type Reprise = {
  readonly colonnes: readonly string[]
  readonly constater: (lieu: LieuAReprendre) => Constat | null
}

export type DefinitionDeReprise<Verdict> = {
  readonly colonnes: readonly string[]
  readonly constater: (lieu: LieuAReprendre) => Verdict | null
  readonly mentions: (verdict: Verdict) => readonly Mention[]
  readonly appliquer: (lieuId: string, verdict: Verdict) => Promise<void>
}

export const reprise = <Verdict>({
  colonnes,
  constater,
  mentions,
  appliquer,
}: DefinitionDeReprise<Verdict>): Reprise => ({
  colonnes,
  constater: (lieu) => {
    const verdict = constater(lieu)

    return verdict == null
      ? null
      : {
          mentions: mentions(verdict),
          appliquer: () => appliquer(lieu.id, verdict),
        }
  },
})
