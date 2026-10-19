import { failure, type Result, success } from '@app/web/libraries/result'
import {
  type Adhesion,
  type AdhesionArchivee,
  adhesionActive,
} from '../../../domain'
import { PasAncienMembre, ToujoursMembre } from './errors'

export const exigerAncienMembre = (
  adhesions: readonly Adhesion[],
): Result<readonly AdhesionArchivee[], ToujoursMembre | PasAncienMembre> => {
  if (adhesionActive(adhesions) !== null) return failure(ToujoursMembre())

  const archivees = adhesions.filter(
    (adhesion): adhesion is AdhesionArchivee => adhesion.statut === 'Archivee',
  )

  return archivees.length === 0
    ? failure(PasAncienMembre())
    : success(archivees)
}
