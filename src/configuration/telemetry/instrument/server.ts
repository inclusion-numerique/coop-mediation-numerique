import { createInstrument } from '@arckit/telemetry/instrument'
import { noopMetrics } from '@arckit/telemetry/metrics'
import { noopTracer } from '@arckit/telemetry/tracer'
import { errorReporter } from '../error-reporter/server'

export const instrument = createInstrument({
  tracer: noopTracer(),
  metrics: noopMetrics(),
  errorReporter,
})
