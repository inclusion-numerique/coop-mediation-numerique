import {
  type AdresseCourriel,
  estRoleProtege,
  type RetraitDuContact,
  RoleProtege,
  type RoleUtilisateur,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import {
  type EchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'
import {
  CibleSupprimee,
  type EchecDeFusionnerDesComptes,
  FusionSurLeMemeCompte,
} from './errors'

export type RoleDeFusion =
  | { readonly _tag: 'Mediateur' }
  | { readonly _tag: 'Coordinateur' }

export const MEDIATEUR: RoleDeFusion = { _tag: 'Mediateur' }

export const COORDINATEUR: RoleDeFusion = { _tag: 'Coordinateur' }

export type EtatDuPartage =
  | { readonly _tag: 'SansPartage' }
  | { readonly _tag: 'Partage' }
  | { readonly _tag: 'PartageRevoque' }

export type RoleDuCompte = { readonly partage: EtatDuPartage }

export type CompteAFusionner = {
  readonly id: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly role: RoleUtilisateur
  readonly supprime: boolean
  readonly mediateur: RoleDuCompte | null
  readonly coordinateur: RoleDuCompte | null
}

export type PlanDeFusion = {
  readonly rolesACreer: readonly RoleDeFusion[]
  readonly rolesAFusionner: readonly RoleDeFusion[]
  readonly partagesARevoquer: readonly RoleDeFusion[]
  readonly revoqueLe: Date
}

export type FusionAutorisee = {
  readonly source: CompteAFusionner
  readonly cible: CompteAFusionner
  readonly plan: PlanDeFusion
}

const ROLES: readonly {
  readonly role: RoleDeFusion
  readonly de: (compte: CompteAFusionner) => RoleDuCompte | null
}[] = [
  { role: MEDIATEUR, de: ({ mediateur }) => mediateur },
  {
    role: COORDINATEUR,
    de: ({ coordinateur }) => coordinateur,
  },
]

const rolesOu = (
  condition: (
    source: RoleDuCompte | null,
    cible: RoleDuCompte | null,
  ) => boolean,
  source: CompteAFusionner,
  cible: CompteAFusionner,
): readonly RoleDeFusion[] =>
  ROLES.filter(({ de }) => condition(de(source), de(cible))).map(
    ({ role }) => role,
  )

const aCreer = (
  source: RoleDuCompte | null,
  cible: RoleDuCompte | null,
): boolean => source !== null && cible === null

const aFusionner = (source: RoleDuCompte | null): boolean => source !== null

const partageARevoquer = (
  source: RoleDuCompte | null,
  cible: RoleDuCompte | null,
): boolean =>
  source?.partage._tag === 'PartageRevoque' && cible?.partage._tag === 'Partage'

const planDeFusion = (
  source: CompteAFusionner,
  cible: CompteAFusionner,
  maintenant: Date,
): PlanDeFusion => ({
  rolesACreer: rolesOu(aCreer, source, cible),
  rolesAFusionner: rolesOu(aFusionner, source, cible),
  partagesARevoquer: rolesOu(partageARevoquer, source, cible),
  revoqueLe: maintenant,
})

export const autoriserFusion = (
  source: CompteAFusionner,
  cible: CompteAFusionner,
  maintenant: Date,
): Result<FusionAutorisee, EchecDeFusionnerDesComptes> => {
  if (source.id === cible.id) return failure(FusionSurLeMemeCompte())
  if (cible.supprime) return failure(CibleSupprimee())
  if (estRoleProtege(source.role))
    return failure(RoleProtege(source.id, source.role))
  if (estRoleProtege(cible.role))
    return failure(RoleProtege(cible.id, cible.role))
  return success({
    source,
    cible,
    plan: planDeFusion(source, cible, maintenant),
  })
}

export type RetraitDeLaSource =
  | { readonly _tag: 'Retire'; readonly retrait: RetraitDuContact }
  | { readonly _tag: 'NonRetire'; readonly echec: EchecTechnique }

export type FusionEffectuee = FusionAutorisee & {
  readonly retraitDeLaSource: RetraitDeLaSource
}
