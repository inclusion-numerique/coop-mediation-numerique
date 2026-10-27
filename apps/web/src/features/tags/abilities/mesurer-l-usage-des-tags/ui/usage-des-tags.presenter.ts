import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import type { Model } from '@app/web/libraries/model'
import type { PorteeDuTag, TagLePlusUtilise } from '../domain'

const scopes = {
  Personnel: TagScope.Personnel,
  Equipe: TagScope.Equipe,
  Departemental: TagScope.Departemental,
  National: TagScope.National,
} satisfies Record<Model.InputOf<typeof PorteeDuTag>, TagScope>

const scopeDeLaPortee = (portee: Model.InputOf<typeof PorteeDuTag>): TagScope =>
  scopes[portee]

export const tagsDeLaListe = (tags: readonly TagLePlusUtilise[]) =>
  tags.map((tag) => ({
    id: tag.id,
    nom: tag.nom,
    scope: scopeDeLaPortee(tag.portee),
    description: tag.description ?? undefined,
    usageCount: tag.utilisations,
    accompagnementsCount: tag.accompagnements,
  }))
