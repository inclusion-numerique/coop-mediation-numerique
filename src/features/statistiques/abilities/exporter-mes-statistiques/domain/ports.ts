export type PreparerLExport<Perimetre, Export> = (
  perimetre: Perimetre,
) => Promise<Export>

export type ExporterMesStatistiquesPorts<Perimetre, Export> = {
  readonly preparerLExport: PreparerLExport<Perimetre, Export>
}
