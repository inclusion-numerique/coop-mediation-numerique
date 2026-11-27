import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  type DescriptionDuTag,
  type NomDuTag,
  porteeChoisie,
  type Tag,
  type VisibiliteChoisie,
  VisibiliteNonAutorisee,
} from '../../../domain'
import type { EchecDeCreerUnTag } from './errors'
import type { CreerUnTagPorts } from './ports'

export const creerUnTag =
  ({ enregistrer }: CreerUnTagPorts) =>
  async ({
    acteur,
    nom,
    description,
    visibilite,
  }: {
    readonly acteur: Acteur
    readonly nom: NomDuTag
    readonly description: DescriptionDuTag | null
    readonly visibilite: VisibiliteChoisie
  }): Promise<Result<Tag, EchecDeCreerUnTag>> => {
    const portee = porteeChoisie(acteur, visibilite)

    if (portee === null) return failure(VisibiliteNonAutorisee())

    const id = await enregistrer({ nom, description, portee })

    return success({ id, nom, description, portee })
  }
