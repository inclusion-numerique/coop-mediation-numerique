import type { Lieu, Origine } from './activite-de-mediation'
import type { Commune } from './commune'
import type { DateDActivite } from './date-d-activite'
import type { EmployeuseId } from './employeuse-id'
import type { IdentifiantCraV1 } from './identifiant-cra-v1'
import type { LieuActiviteId } from './lieu-activite-id'
import type { RdvId } from './rdv-id'

export type LieuSaisi =
  | { readonly _tag: 'LieuActivite'; readonly lieuActiviteId: LieuActiviteId }
  | { readonly _tag: 'Domicile'; readonly commune: Commune }
  | { readonly _tag: 'Autre'; readonly commune: Commune }
  | { readonly _tag: 'ADistance' }

export type EmployeuseALaDate = {
  readonly id: EmployeuseId
  readonly commune: Commune | null
}

export type EmployeuseDeLaDate = (
  date: DateDActivite,
) => Promise<EmployeuseALaDate | null>

export type LieuUtilisable = (
  lieu: LieuActiviteId,
  lieuActuel: LieuActiviteId | null,
) => Promise<boolean>

export type MarquerLeRendezVousHonore = (rdvId: RdvId) => Promise<void>

export const lieuDeLaSaisie = (
  lieu: LieuSaisi,
  employeuse: EmployeuseALaDate | null,
): Lieu =>
  lieu._tag === 'ADistance'
    ? {
        _tag: 'ADistance',
        communeDeRattachement: employeuse?.commune ?? null,
      }
    : lieu

export const origineDeLaSaisie = ({
  rdvId,
  identifiantV1,
}: {
  readonly rdvId: RdvId | null
  readonly identifiantV1: IdentifiantCraV1 | null
}): Origine => {
  if (identifiantV1 !== null) {
    return { _tag: 'ImportV1', identifiant: identifiantV1 }
  }
  return rdvId === null ? { _tag: 'Saisie' } : { _tag: 'RendezVous', rdvId }
}
