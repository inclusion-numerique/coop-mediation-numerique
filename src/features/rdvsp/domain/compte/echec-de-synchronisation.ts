export class EchecDeSynchronisation extends Error {
  constructor(
    readonly motif: string,
    diagnostic: string,
  ) {
    super(`Impossible de synchroniser le compte RDV (${diagnostic})`)
    this.name = 'EchecDeSynchronisation'
  }
}

const motifsDefinitifs: readonly string[] = [
  'JetonRevoque',
  'AccesRefuse',
  'AgentSupprime',
]

export const echecDefinitif = (erreur: unknown): boolean =>
  erreur instanceof EchecDeSynchronisation &&
  motifsDefinitifs.includes(erreur.motif)
