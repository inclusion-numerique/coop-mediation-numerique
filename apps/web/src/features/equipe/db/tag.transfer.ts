import { NomTag, type TagExistant, TagId } from '../domain'

/**
 * Les tags déjà détenus, tels que le domaine sait les comparer.
 *
 * `safe` plutôt que le constructeur strict : la colonne `nom` n'a pas de
 * contrainte de non-vacuité en base. Un nom inexploitable ne peut de toute façon
 * accueillir aucun essaimage — on l'écarte au lieu de faire échouer le
 * détachement entier pour une donnée héritée.
 */
export const tagsDetenusToDomain = (
  rows: readonly { id: string; nom: string }[],
): readonly TagExistant[] =>
  rows.flatMap(({ id, nom }) => {
    const nomTag = NomTag.safe(nom)

    return nomTag === null ? [] : [{ id: TagId(id), nom: nomTag }]
  })
