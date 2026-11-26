import {
  type AuteurId,
  CompteSupprime,
  type CoordinateurId,
  coordinateurDe,
  coordinateurEstVierge,
  estRoleProtege,
  type MediateurId,
  mediateurDe,
  mediateurEstVierge,
  type ProductionCoordinateur,
  type ProductionMediateur,
  type Rattachements,
  RoleProtege,
  type RoleUtilisateur,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { type EchecDeChangerLesRoles, RoleNonVierge } from './errors'
import type { RolesDemandes } from './roles-demandes'

export type MediateurAReaffecter = ProductionMediateur & {
  readonly id: MediateurId
}

export type CoordinateurAReaffecter = ProductionCoordinateur & {
  readonly id: CoordinateurId
}

export type CompteAReaffecter = {
  readonly id: UtilisateurId
  readonly role: RoleUtilisateur
  readonly supprime: boolean
  readonly rattachements: Rattachements<
    MediateurAReaffecter,
    CoordinateurAReaffecter
  >
}

export type OperationRole =
  | { readonly _tag: 'AjouterMediateur' }
  | { readonly _tag: 'AjouterCoordinateur' }
  | { readonly _tag: 'RetirerMediateur'; readonly mediateurId: MediateurId }
  | {
      readonly _tag: 'RetirerCoordinateur'
      readonly coordinateurId: CoordinateurId
    }

export type PlanDeChangement = {
  readonly operations: readonly OperationRole[]
}

export type RolesChanges = {
  readonly utilisateurId: UtilisateurId
  readonly auteurId: AuteurId | null
  readonly plan: PlanDeChangement
}

const operationsDuMediateur = (
  mediateur: MediateurAReaffecter | null,
  demande: RolesDemandes,
): Result<readonly OperationRole[], EchecDeChangerLesRoles> => {
  if (demande.mediateur)
    return success(mediateur === null ? [{ _tag: 'AjouterMediateur' }] : [])
  if (mediateur === null) return success([])
  if (!mediateurEstVierge(mediateur)) return failure(RoleNonVierge('Mediateur'))
  return success([{ _tag: 'RetirerMediateur', mediateurId: mediateur.id }])
}

const operationsDuCoordinateur = (
  coordinateur: CoordinateurAReaffecter | null,
  demande: RolesDemandes,
): Result<readonly OperationRole[], EchecDeChangerLesRoles> => {
  if (demande.coordinateur)
    return success(
      coordinateur === null ? [{ _tag: 'AjouterCoordinateur' }] : [],
    )
  if (coordinateur === null) return success([])
  if (!coordinateurEstVierge(coordinateur))
    return failure(RoleNonVierge('Coordinateur'))
  return success([
    { _tag: 'RetirerCoordinateur', coordinateurId: coordinateur.id },
  ])
}

const ordre: Record<OperationRole['_tag'], number> = {
  AjouterMediateur: 0,
  AjouterCoordinateur: 0,
  RetirerMediateur: 1,
  RetirerCoordinateur: 1,
}

export const planDeChangement = (
  compte: CompteAReaffecter,
  demande: RolesDemandes,
): Result<PlanDeChangement, EchecDeChangerLesRoles> => {
  if (estRoleProtege(compte.role))
    return failure(RoleProtege(compte.id, compte.role))
  if (compte.supprime) return failure(CompteSupprime(compte.id))

  const mediateur = operationsDuMediateur(
    mediateurDe(compte.rattachements),
    demande,
  )
  if (!mediateur.success) return mediateur

  const coordinateur = operationsDuCoordinateur(
    coordinateurDe(compte.rattachements),
    demande,
  )
  if (!coordinateur.success) return coordinateur

  return success({
    operations: [...mediateur.data, ...coordinateur.data].toSorted(
      (premiere, seconde) => ordre[premiere._tag] - ordre[seconde._tag],
    ),
  })
}
