import { createNoopReporter } from '@arckit/telemetry/error-reporter'

export const errorReporter = createNoopReporter()

export const register = async (): Promise<void> => undefined

export const onRequestError = (): void => undefined

export const flush = async (_delai: number): Promise<boolean> => true
