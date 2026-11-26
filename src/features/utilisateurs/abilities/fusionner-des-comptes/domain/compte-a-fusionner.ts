import { z } from 'zod'
import {
  type AdresseCourriel,
  estRoleProtege,
  RoleProtege,
  type RoleUtilisateur,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { defineModel, type Model } from '@/libraries/model'
import { failure, type Result, success } from '@/libraries/result'
import {
  CibleSupprimee,
  type EchecDeFusionnerDesComptes,
  FusionSurLeMemeCompte,
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
): Result<FusionAutorisee, EchecDeFusionnerDesComptes> => {
  if (memeCompte(source.id, cible.id)) return failure(FusionSurLeMemeCompte())
  if (cible.supprime) return failure(CibleSupprimee())
  if (estRoleProtege(source.role))
    return failure(RoleProtege(UtilisateurId(source.id), source.role))
  if (estRoleProtege(cible.role))
    return failure(RoleProtege(UtilisateurId(cible.id), cible.role))
  return success({ source, cible })
}
