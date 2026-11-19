export const copieDeLaCoordination = <T extends object>(valeurs: T) => ({
  ...valeurs,
  id: undefined,
})

export const departDuPartenariat = <T extends object>(valeurs: T) => ({
  structuresPartenaires: [{}],
  ...valeurs,
})
