export type ContratMembre = {
  readonly type: string | null
  readonly debut: Date | null
  readonly fin: Date | null
}

export type MembreAExporter<Ligne> = {
  readonly ligne: Ligne
  readonly contrat: ContratMembre | null
}
