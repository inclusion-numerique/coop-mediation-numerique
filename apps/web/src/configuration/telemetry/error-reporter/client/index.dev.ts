import { createLoggerReporter } from '@arckit/telemetry/error-reporter'
import { createConsoleLogger } from '@arckit/telemetry/logger'

export const errorReporter = createLoggerReporter({
  logger: createConsoleLogger(),
})

export const register = (): void => undefined

export const onRouterTransitionStart = (
  _url: string,
  _navigationType: 'push' | 'replace' | 'traverse',
): void => undefined
