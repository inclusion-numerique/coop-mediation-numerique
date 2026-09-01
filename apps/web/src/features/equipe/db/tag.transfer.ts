import type { Prisma } from '@prisma/client'
import type { ProprietaireTag } from '../domain'
import { NomTag, type TagExistant, TagId } from '../domain'

/**
 * Le détenteur, vers les deux colonnes nullables que la table porte.
 *
 * L'écriture est TOTALE : celle qui n'est pas retenue est explicitement remise à
 * `null`. Sans ça, une bascule médiateur → coordinateur laisserait les deux
 * renseignées, l'état que l'union du domaine sert justement à interdire.
 */
export const proprietaireFromDomain = (
  proprietaire: ProprietaireTag,
): Pick<
  Prisma.TagUncheckedUpdateManyInput,
  'mediateurId' | 'coordinateurId'
> =>
  proprietaire._tag === 'mediateur'
    ? { mediateurId: proprietaire.mediateurId, coordinateurId: null }
    : { mediateurId: null, coordinateurId: proprietaire.coordinateurId }

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
