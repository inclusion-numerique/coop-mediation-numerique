import {
  type AdresseCourriel,
  estRoleProtege,
  RoleProtege,
  type RoleUtilisateur,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import {
  CibleSupprimee,
  type EchecDeFusionnerDesComptes,
  FusionSurLeMemeCompte,
} from './errors'

export type CompteAFusionner = {
  readonly id: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly role: RoleUtilisateur
  readonly supprime: boolean
}

export type FusionAutorisee = {
  readonly source: CompteAFusionner
  readonly cible: CompteAFusionner
}

export const autoriserFusion = (
  source: CompteAFusionner,
  cible: CompteAFusionner,
): Result<FusionAutorisee, EchecDeFusionnerDesComptes> => {
  if (source.id === cible.id) return failure(FusionSurLeMemeCompte())
  if (cible.supprime) return failure(CibleSupprimee())
  if (estRoleProtege(source.role))
    return failure(RoleProtege(source.id, source.role))
  if (estRoleProtege(cible.role))
    return failure(RoleProtege(cible.id, cible.role))
  return success({ source, cible })
}
