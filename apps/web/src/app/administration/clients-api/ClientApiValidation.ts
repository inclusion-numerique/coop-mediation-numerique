import { apiClientScopeValues } from '@app/web/app/administration/clients-api/apiClient'
import z from 'zod'

// Represents an object returned by the BAN API
export const ClientApiValidation = z.object({
  id: z.guid().nullish(), // set if update, not set if create
  name: z.string({
    error: 'Veuillez renseigner un nom',
  }),
  validFrom: z
    .string({
      error: 'Veuillez renseigner une date de début de validité',
    })
    .date('Veuillez renseigner une date valide'),
  validUntil: z.string().date('Veuillez renseigner une date valide').nullish(),
  scopes: z
    .array(
      z.enum(apiClientScopeValues, {
        error: 'Veuillez renseigner un scope valide',
      }),
      {
        error: 'Veuillez renseigner au moins un scope',
      },
    )
    .min(1, 'Veuillez renseigner au moins un scope'),
})

export type ClientApiData = z.infer<typeof ClientApiValidation>
