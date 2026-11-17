import { failure, type Result, success } from '@app/web/libraries/result'
import type { AdhesionId } from './adhesion-id'
import type { CoordinateurId } from './coordinateur-id'
import { DejaMembre, PasMembre } from './errors'
import type { MediateurId } from './mediateur-id'

type SocleAdhesion = {
  readonly id: AdhesionId
  readonly mediateurId: MediateurId
  readonly coordinateurId: CoordinateurId
  readonly depuis: Date
}

export type AdhesionActive = SocleAdhesion & { readonly statut: 'Active' }

export type AdhesionArchivee = SocleAdhesion & {
  readonly statut: 'Archivee'
  readonly archiveeLe: Date
}

export type Adhesion = AdhesionActive | AdhesionArchivee

export type NouvelleAdhesion = {
  readonly mediateurId: MediateurId
  readonly coordinateurId: CoordinateurId
}

export const adhesionActive = (
  adhesions: readonly Adhesion[],
): AdhesionActive | null =>
  adhesions.find(
    (adhesion): adhesion is AdhesionActive => adhesion.statut === 'Active',
  ) ?? null

export const archiver = (
  adhesions: readonly Adhesion[],
  maintenant: Date,
): Result<AdhesionArchivee, PasMembre> => {
  const active = adhesionActive(adhesions)

  return active === null
    ? failure(PasMembre())
    : success({ ...active, statut: 'Archivee', archiveeLe: maintenant })
}

export const adherer = (
  nouvelle: NouvelleAdhesion,
  adhesionsDeLaPaire: readonly Adhesion[],
): Result<NouvelleAdhesion, DejaMembre> =>
  adhesionActive(adhesionsDeLaPaire) === null
    ? success(nouvelle)
    : failure(DejaMembre(nouvelle.mediateurId))
