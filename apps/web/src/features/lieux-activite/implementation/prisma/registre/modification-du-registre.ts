import { coopCartographieNationaleSource } from '@app/web/libraries/cartographie-nationale'
import {
  type DerniereModification,
  ModifieParSource,
  SourceCartographie,
} from '../../../domain/tracabilite'
import type { InscriptionPourLaFiche } from './fiche-du-registre'

/**
 * La dernière main sur la fiche, quand elle n'est pas la nôtre.
 *
 * Deux conditions, cumulatives, et l'ordre importe peu — c'est leur conjonction
 * qui fait la vérité.
 *
 * La source doit d'abord être un tiers. Un moissonnage carto touche
 * `updated_at_carto` sans rien changer aux valeurs : sur les 108 inscriptions
 * qu'une source tierce a horodatées après la dernière modification coop, 79
 * annoncent encore `Coop numérique`. Le seul horodatage dirait donc « modifié
 * par la carto » à propos de fiches dont la coop tient toujours les valeurs.
 *
 * Puis cette source doit avoir écrit après nous. Une modification carto plus
 * ancienne que la nôtre ne dit rien de neuf.
 *
 * Restent 29 lieux aujourd'hui — peu, mais ce sont exactement ceux dont le
 * médiateur ne voit pas, sans cela, que quelqu'un d'autre a repris sa fiche.
 *
 * Ce jugement était rendu chaque nuit par le job de réconciliation, qui
 * l'écrivait dans une colonne de la coop. Il est désormais rendu à la lecture,
 * donc toujours à jour, et la colonne n'a plus de raison d'être.
 */
export const derniereModificationExterne = (
  inscription: Pick<
    InscriptionPourLaFiche,
    'source' | 'updatedAtCarto' | 'updatedAtMin'
  >,
  modificationCoop: Date,
): DerniereModification | null => {
  const source = SourceCartographie.safe(inscription.source ?? '')

  if (source == null || source === coopCartographieNationaleSource) return null

  const dates = [inscription.updatedAtCarto, inscription.updatedAtMin].filter(
    (date): date is Date => date != null,
  )

  if (dates.length === 0) return null

  const derniere = dates.reduce((plus, date) => (date > plus ? date : plus))

  return derniere > modificationCoop ? ModifieParSource(derniere, source) : null
}
