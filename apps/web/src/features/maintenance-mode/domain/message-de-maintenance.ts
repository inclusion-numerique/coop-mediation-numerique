import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const MESSAGE_DE_MAINTENANCE_PAR_DEFAUT = `Une opération de maintenance est en cours.
Les modifications sont temporairement désactivées, vous pouvez toujours consulter vos données.`

export const MessageDeMaintenance = defineModel(
  z.string().trim().min(1).max(500).brand('MessageDeMaintenance'),
)

export type MessageDeMaintenance = Model.TypeOf<typeof MessageDeMaintenance>
