import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  type DescriptionDuTag,
  type NomDuTag,
  type Portee,
  porteeChoisie,
  type Tag,
  type TagId,
  type VisibiliteChoisie,
  VisibiliteNonAutorisee,
} from '../../../domain'

export type EnregistrerUnTag = (tag: {
  readonly nom: NomDuTag
  readonly description: DescriptionDuTag | null
  readonly portee: Portee
}) => Promise<TagId>

export const creerUnTag =
  ({ enregistrer }: { readonly enregistrer: EnregistrerUnTag }) =>
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
  }): Promise<Result<Tag, VisibiliteNonAutorisee>> => {
    const portee = porteeChoisie(acteur, visibilite)

    if (portee === null) return failure(VisibiliteNonAutorisee())

    const id = await enregistrer({ nom, description, portee })

    return success({ id, nom, description, portee })
  }
