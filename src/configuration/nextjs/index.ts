import { errorReporter } from '@/configuration/telemetry/serveur'
import { actionBuilder as baseActionBuilder } from '@/libraries/nextjs'

export const actionBuilder = (
  options: { readonly errorPrefix?: string } = {},
) => baseActionBuilder({ ...options, errorReporter })
