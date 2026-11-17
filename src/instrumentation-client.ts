import {
  onRouterTransitionStart,
  register,
} from '@app/web/configuration/telemetry/error-reporter/client'

register()

export { onRouterTransitionStart }
