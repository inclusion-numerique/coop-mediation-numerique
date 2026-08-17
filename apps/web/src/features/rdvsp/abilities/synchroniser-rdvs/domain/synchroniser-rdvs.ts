import type { Result } from '@app/web/libraries/result'
import type { CompteRdvUtilisable } from '../../../domain/compte-rdv'
import type { ErreurRdvApi } from '../../../domain/errors'
import type { OrganisationId } from '../../../domain/organisation-id'
import type { RdvId } from '../../../domain/rdv-id'
import type { BilanModele } from './plan-modele'
import type { EtatConnu, PlanLot } from './plan-rdvs'

export type BilanSynchronisationRdvs = {
  readonly rdvs: BilanModele & { readonly count: number }
  readonly usagers: BilanModele & { readonly count: number }
  readonly motifs: BilanModele & { readonly count: number }
  readonly lieux: BilanModele & { readonly count: number }
}

export type PortéeSynchronisation = {
  readonly compte: CompteRdvUtilisable
  /**
   * Restreint la synchronisation à ces organisations. Une liste vide ne
   * signifie pas « toutes » mais « aucune » — le cas des comptes dont aucun
   * webhook n'a échoué.
   */
  readonly organisationIds?: readonly OrganisationId[]
}

export type SynchroniserRdvs = (
  portee: PortéeSynchronisation,
) => Promise<Result<BilanSynchronisationRdvs, ErreurRdvApi>>

/** Identifiants des rendez-vous déjà détenus, dans le périmètre synchronisé. */
export type RdvsDejaImportes = (
  portee: PortéeSynchronisation,
) => Promise<readonly RdvId[]>

export type EtatConnuDuLot = (input: {
  readonly rdvIds: readonly RdvId[]
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<EtatConnu>

export type AppliquerPlanLot = (input: {
  readonly compte: CompteRdvUtilisable
  readonly plan: PlanLot
  /**
   * Trace d'origine de chaque rendez-vous, indexée par identifiant. Elle voyage
   * hors du plan : le domaine n'a rien à faire d'un payload, seule l'écriture le
   * conserve.
   */
  readonly bruts: ReadonlyMap<RdvId, unknown>
}) => Promise<void>

export type SupprimerRdvs = (rdvIds: readonly RdvId[]) => Promise<void>

/**
 * Rapproche les bénéficiaires des usagers importés. L'échec est absorbé par
 * l'implémentation : une donnée d'usager inexploitable ne doit jamais empêcher
 * les rendez-vous d'être à jour.
 */
export type RapprocherBeneficiaires = (input: {
  readonly usagerIds: readonly number[]
}) => Promise<void>
