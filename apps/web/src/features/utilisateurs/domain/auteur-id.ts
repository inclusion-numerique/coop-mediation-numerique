import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Identifiant de qui DEMANDE la suppression — brand distinct de
 * `UtilisateurId` à dessein.
 *
 * Auteur et cible sont deux uuid interchangeables à l'œil, et les intervertir
 * supprimerait le mauvais compte sans qu'aucun test ne s'en aperçoive. C'est
 * exactement la forme du couple `targetId`/`destinationId` qui avait produit une
 * fusion de doublons silencieuse : ici, le compilateur refuse l'inversion.
 */
export const AuteurId = defineModel(z.string().uuid().brand('AuteurId'))

export type AuteurId = Model.TypeOf<typeof AuteurId>
