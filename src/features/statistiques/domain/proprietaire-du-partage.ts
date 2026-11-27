export type ProprietaireDuPartage = {
  readonly _tag: 'Mediateur' | 'Coordinateur'
}

export const coordinationDuPartage = <Coordination>(
  proprietaire: ProprietaireDuPartage,
  coordination: Coordination,
): Coordination | null =>
  proprietaire._tag === 'Coordinateur' ? coordination : null
