import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Le nom sous lequel l'établissement est connu de SIRENE, quand il diffère de
 * celui que le lieu se donne. Il peut valoir `[Non diffusible]` : c'est une
 * réponse de l'API Entreprise, qu'on stocke telle quelle.
 */
export const NomUsage = defineModel(z.string().trim().min(1).brand('NomUsage'))

export type NomUsage = Model.TypeOf<typeof NomUsage>

/**
 * Ce que la coop sait de l'établissement au répertoire SIRENE, distinct du
 * `Pivot` du schéma national : le pivot identifie, ceci trace une consultation.
 *
 * `nomUsage` ne dépend pas du SIRET — 26 lieux en portent un sans SIRET — donc
 * les deux champs ne forment pas une union.
 */
export type IdentiteSirene = {
  readonly nomUsage: NomUsage | null
  readonly synchronisation: Date | null
}
