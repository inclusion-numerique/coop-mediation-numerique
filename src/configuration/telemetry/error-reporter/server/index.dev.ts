import { createLoggerReporter } from '@arckit/telemetry/error-reporter'
import { createConsoleLogger } from '@arckit/telemetry/logger'

export const errorReporter = createLoggerReporter({
  logger: createConsoleLogger(),
})

export const register = async (): Promise<void> => undefined

export const onRequestError = (): void => undefined

export const flush = async (_delai: number): Promise<boolean> => true
