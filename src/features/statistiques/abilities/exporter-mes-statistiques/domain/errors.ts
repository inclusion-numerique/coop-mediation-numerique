export type ExportNonAutorise = { readonly _tag: 'ExportNonAutorise' }

export const ExportNonAutorise = (): ExportNonAutorise => ({
  _tag: 'ExportNonAutorise',
})

export type ExportDUnAutreMediateur = {
  readonly _tag: 'ExportDUnAutreMediateur'
}

export const ExportDUnAutreMediateur = (): ExportDUnAutreMediateur => ({
  _tag: 'ExportDUnAutreMediateur',
})

export type EchecDeExporterMesStatistiques =
  | ExportNonAutorise
  | ExportDUnAutreMediateur
