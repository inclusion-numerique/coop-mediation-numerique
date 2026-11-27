export const inscriptionPourLIdentifiantCarto = {
  select: { structureCartographieNationaleId: true },
}

type AvecInscription = {
  readonly inscriptionRegistre: {
    readonly structureCartographieNationaleId: string | null
  } | null
}

export const avecIdentifiantCarto = <T extends AvecInscription>(
  lieu: T,
): Omit<T, 'inscriptionRegistre'> & {
  readonly structureCartographieNationaleId: string | null
} => {
  const { inscriptionRegistre, ...reste } = lieu

  return {
    ...reste,
    structureCartographieNationaleId:
      inscriptionRegistre?.structureCartographieNationaleId ?? null,
  }
}
