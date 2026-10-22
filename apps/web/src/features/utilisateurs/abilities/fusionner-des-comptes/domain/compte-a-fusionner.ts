import {
  type AdresseCourriel,
  estRoleProtege,
  type RoleUtilisateur,
} from '@app/web/features/utilisateurs/domain'
import { defineModel, type Model } from '@app/web/libraries/model'
import { failure, type Result, success } from '@app/web/libraries/result'
import { z } from 'zod'
import {
  CibleSupprimee,
  type FusionnerError,
  FusionSurLeMemeCompte,
  RoleProtege,
} from './errors'

export const SourceFusionId = defineModel(z.guid().brand('SourceFusionId'))
export type SourceFusionId = Model.TypeOf<typeof SourceFusionId>

export const CibleFusionId = defineModel(z.guid().brand('CibleFusionId'))
export type CibleFusionId = Model.TypeOf<typeof CibleFusionId>

export type CompteAFusionner<Id> = {
  readonly id: Id
  readonly courriel: AdresseCourriel
  readonly role: RoleUtilisateur
  readonly supprime: boolean
}

export type FusionAutorisee = {
  readonly source: CompteAFusionner<SourceFusionId>
  readonly cible: CompteAFusionner<CibleFusionId>
}

const memeCompte = (source: SourceFusionId, cible: CibleFusionId): boolean =>
  String(source) === String(cible)

export const autoriserFusion = (
  source: CompteAFusionner<SourceFusionId>,
  cible: CompteAFusionner<CibleFusionId>,
): Result<FusionAutorisee, FusionnerError> => {
  if (memeCompte(source.id, cible.id)) return failure(FusionSurLeMemeCompte())
  if (cible.supprime) return failure(CibleSupprimee())
  if (estRoleProtege(source.role) || estRoleProtege(cible.role))
    return failure(RoleProtege())
  return success({ source, cible })
}
