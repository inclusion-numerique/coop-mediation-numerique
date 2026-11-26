import type { CodeDepartement } from '@/libraries/insee'
import type {
  CoordinateurId,
  DescriptionDuTag,
  MediateurId,
  NomDuTag,
  TagId,
} from '../../../domain'
import type { RetraitApplique, RetraitDesTags } from './retrait-des-tags'

export type TagDuCoordinateur = {
  readonly id: TagId
  readonly nom: NomDuTag
  readonly description: DescriptionDuTag | null
  readonly departement: CodeDepartement | null
  readonly utilisateurs: readonly MediateurId[]
}

export type TagsDuCompte = {
  readonly duMediateur: readonly TagId[]
  readonly duCoordinateur: readonly TagDuCoordinateur[]
}

export type TagDetenu = {
  readonly id: TagId
  readonly nom: NomDuTag
}

export type TagsDetenus = {
  readonly mediateurId: MediateurId
  readonly tags: readonly TagDetenu[]
}

export type LireLesTagsDuCompte = (compte: {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
}) => Promise<TagsDuCompte>

export type LireLesTagsDetenus = (
  mediateurIds: readonly MediateurId[],
) => Promise<readonly TagsDetenus[]>

export type AppliquerLeRetraitDesTags = (
  retrait: RetraitDesTags,
) => Promise<RetraitApplique>

export type RetirerLesTagsDUnComptePorts = {
  readonly lireLesTagsDuCompte: LireLesTagsDuCompte
  readonly lireLesTagsDetenus: LireLesTagsDetenus
  readonly appliquerLeRetrait: AppliquerLeRetraitDesTags
}
