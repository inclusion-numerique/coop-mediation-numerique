import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * L'identifiant de la voie dans la Base Adresse Nationale (`80144_0018_00090`)
 * — pas l'uuid de l'adresse. Le schéma national ne le transporte pas : il ne
 * sert qu'au géocodage et au recollement côté coop.
 */
export const BanId = defineModel(z.string().trim().min(1).brand('BanId'))

export type BanId = Model.TypeOf<typeof BanId>
