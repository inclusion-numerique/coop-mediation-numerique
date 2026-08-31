import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Référence locale vers l'entité médiateur d'une autre feature (AR-3) : la
 * feature `utilisateurs` en a besoin pour dire à qui s'adressent les charges
 * d'effacement, sans importer le domaine de `beneficiaire` ni de `mediateurs`.
 */
export const MediateurId = defineModel(z.string().uuid().brand('MediateurId'))

export type MediateurId = Model.TypeOf<typeof MediateurId>
