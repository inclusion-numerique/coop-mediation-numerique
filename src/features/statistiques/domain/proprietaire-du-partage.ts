export type ProprietaireDuPartage = {
  readonly _tag: 'Mediateur' | 'Coordinateur'
}

export const montreLEquipe = (proprietaire: ProprietaireDuPartage): boolean =>
  proprietaire._tag === 'Coordinateur'
