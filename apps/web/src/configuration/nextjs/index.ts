import { errorReporter } from '@app/web/configuration/telemetry/error-reporter/server'
import { actionBuilder as baseActionBuilder } from '@app/web/libraries/nextjs'

export const actionBuilder = (
  options: { readonly errorPrefix?: string } = {},
) => baseActionBuilder({ ...options, errorReporter })
