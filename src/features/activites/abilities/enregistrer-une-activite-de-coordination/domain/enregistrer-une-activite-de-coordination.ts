import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type ActiviteDeCoordinationId,
  ActiviteIntrouvable,
  type CoordinateurId,
  TypeDActiviteIncompatible,
  tagsDeLaSaisie,
} from '../../../domain'
import type { EchecDEnregistrerUneActiviteDeCoordination } from './errors'
import type {
  ActiviteDeCoordinationDuCoordinateur,
  EnregistrerUneActiviteDeCoordinationPorts,
  NouvelIdentifiantDeCoordination,
} from './ports'
import {
  activiteDeLaSaisie,
  type EcritureDeCoordination,
  type SaisieDeCoordination,
} from './saisie-de-coordination'

type Enregistrement =
  | { readonly _tag: 'Creation'; readonly id: ActiviteDeCoordinationId }
  | {
      readonly _tag: 'Modification'
      readonly id: ActiviteDeCoordinationId
      readonly creation: Date
    }

const enregistrementDe =
  (
    activiteDuCoordinateur: ActiviteDeCoordinationDuCoordinateur,
    nouvelIdentifiant: NouvelIdentifiantDeCoordination,
  ) =>
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
  ({
    activiteDuCoordinateur,
    nouvelIdentifiant,
    tagsUtilisables,
    creer,
    modifier,
  }: EnregistrerUneActiviteDeCoordinationPorts) =>
  async ({
    saisie,
    coordinateurId,
    maintenant,
  }: {
    readonly saisie: SaisieDeCoordination
    readonly coordinateurId: CoordinateurId | null
    readonly maintenant: Date
  }): Promise<
    Result<EcritureDeCoordination, EchecDEnregistrerUneActiviteDeCoordination>
  > => {
    if (coordinateurId === null) return failure(ActionNonAutorisee())

    const enregistrement = await enregistrementDe(
      activiteDuCoordinateur,
      nouvelIdentifiant,
    )(saisie, coordinateurId)
    if (!enregistrement.success) return enregistrement

    const tags = tagsDeLaSaisie(saisie.tags, await tagsUtilisables(saisie.tags))
    if (!tags.success) return tags

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

    const ecriture: EcritureDeCoordination = {
      _tag: enregistrement.data._tag,
      activite: activite.data,
    }
    await (ecriture._tag === 'Creation'
      ? creer(ecriture.activite)
      : modifier(ecriture.activite))

    return success(ecriture)
  }
