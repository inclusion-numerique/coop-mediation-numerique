import {
  type Adhesion,
  AdhesionId,
  CoordinateurId,
  MediateurId,
} from '../domain'

export const adhesionSelect = {
  id: true,
  mediateurId: true,
  coordinateurId: true,
  creation: true,
  suppression: true,
} as const

export type AdhesionRow = {
  readonly id: string
  readonly mediateurId: string
  readonly coordinateurId: string
  readonly creation: Date
  readonly suppression: Date | null
}

export const toAdhesion = (row: AdhesionRow): Adhesion => {
  const socle = {
    id: AdhesionId(row.id),
    mediateurId: MediateurId(row.mediateurId),
    coordinateurId: CoordinateurId(row.coordinateurId),
    depuis: row.creation,
  }

  return row.suppression == null
    ? { ...socle, statut: 'Active' }
    : { ...socle, statut: 'Archivee', archiveeLe: row.suppression }
}

export const fromAdhesion = (adhesion: Adhesion): AdhesionRow => ({
  id: adhesion.id,
  mediateurId: adhesion.mediateurId,
  coordinateurId: adhesion.coordinateurId,
  creation: adhesion.depuis,
  suppression: adhesion.statut === 'Archivee' ? adhesion.archiveeLe : null,
})
