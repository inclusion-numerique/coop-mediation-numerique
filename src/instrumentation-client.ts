import {
  onRouterTransitionStart,
  register,
} from '@/configuration/telemetry/error-reporter/client'

register()

export { onRouterTransitionStart }
