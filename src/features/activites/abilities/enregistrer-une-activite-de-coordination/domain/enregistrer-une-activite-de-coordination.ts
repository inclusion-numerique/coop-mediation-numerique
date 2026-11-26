import { failure, type Result, success } from '@/libraries/result'
import {
  type ActiviteDeCoordination,
  type ActiviteDeCoordinationId,
  ActiviteIntrouvable,
  type CoordinateurId,
  type DateTropLointaine,
  type TagInutilisable,
  type TagsUtilisables,
  type TypeDActiviteDeCoordination,
  TypeDActiviteIncompatible,
  tagsDeLaSaisie,
} from '../../../domain'
import { ActionNonAutorisee } from './errors'
import {
  type ActiviteEnregistree,
  activiteDeLaSaisie,
  type SaisieDeCoordination,
} from './saisie-de-coordination'

export type EchecDEnregistrement =
  | ActionNonAutorisee
  | ActiviteIntrouvable
  | TypeDActiviteIncompatible
  | TagInutilisable
  | DateTropLointaine

export type ActiviteDeCoordinationExistante = {
  readonly type: TypeDActiviteDeCoordination
  readonly creation: Date
}

export type ActiviteDeCoordinationDuCoordinateur = (criteres: {
  readonly id: ActiviteDeCoordinationId
  readonly coordinateurId: CoordinateurId
}) => Promise<ActiviteDeCoordinationExistante | null>

export type EcrireLActiviteDeCoordination = (
  activite: ActiviteDeCoordination,
) => Promise<void>

export type DependancesDeLaSaisieDeCoordination = {
  readonly activiteDuCoordinateur: ActiviteDeCoordinationDuCoordinateur
  readonly nouvelIdentifiant: () => ActiviteDeCoordinationId
  readonly tagsUtilisables: TagsUtilisables
  readonly creer: EcrireLActiviteDeCoordination
  readonly modifier: EcrireLActiviteDeCoordination
  readonly maintenant: () => Date
}

type Enregistrement =
  | { readonly _tag: 'Creation'; readonly id: ActiviteDeCoordinationId }
  | {
      readonly _tag: 'Modification'
      readonly id: ActiviteDeCoordinationId
      readonly creation: Date
    }

const enregistrementDe =
  ({
    activiteDuCoordinateur,
    nouvelIdentifiant,
  }: DependancesDeLaSaisieDeCoordination) =>
  async (
    saisie: SaisieDeCoordination,
    coordinateurId: CoordinateurId,
  ): Promise<
    Result<Enregistrement, ActiviteIntrouvable | TypeDActiviteIncompatible>
  > => {
    if (saisie.id === null) {
      return success({ _tag: 'Creation', id: nouvelIdentifiant() })
    }
    const activite = await activiteDuCoordinateur({
      id: saisie.id,
      coordinateurId,
    })
    if (activite === null) return failure(ActiviteIntrouvable())
    return activite.type === saisie._tag
      ? success({
          _tag: 'Modification',
          id: saisie.id,
          creation: activite.creation,
        })
      : failure(TypeDActiviteIncompatible())
  }

export const enregistrerUneActiviteDeCoordination =
  (dependances: DependancesDeLaSaisieDeCoordination) =>
  async ({
    saisie,
    coordinateurId,
  }: {
    readonly saisie: SaisieDeCoordination
    readonly coordinateurId: CoordinateurId | null
  }): Promise<Result<ActiviteEnregistree, EchecDEnregistrement>> => {
    if (coordinateurId === null) return failure(ActionNonAutorisee())

    const enregistrement = await enregistrementDe(dependances)(
      saisie,
      coordinateurId,
    )
    if (!enregistrement.success) return enregistrement

    const tags = tagsDeLaSaisie(
      saisie.tags,
      await dependances.tagsUtilisables(saisie.tags),
    )
    if (!tags.success) return tags

    const maintenant = dependances.maintenant()
    const activite = activiteDeLaSaisie({
      saisie,
      id: enregistrement.data.id,
      coordinateurId,
      tags: tags.data,
      creation:
        enregistrement.data._tag === 'Modification'
          ? enregistrement.data.creation
          : maintenant,
      maintenant,
    })
    if (!activite.success) return activite

    await (enregistrement.data._tag === 'Creation'
      ? dependances.creer(activite.data)
      : dependances.modifier(activite.data))

    return success({ id: activite.data.id, type: activite.data._tag })
  }
