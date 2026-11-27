import type { SourceExterne } from '../../../domain/registre/source-externe'

export type SourceIndisponible = {
  readonly _tag: 'SourceIndisponible'
  readonly source: SourceExterne
}

export const SourceIndisponible = (
  source: SourceExterne,
): SourceIndisponible => ({ _tag: 'SourceIndisponible', source })

export type EchecDeRechercherDesLieuxAAjouter = never
