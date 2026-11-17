import configuration from '../next.config.mjs'

export default {
  ...configuration,
  experimental: { ...configuration.experimental, externalDir: true },
}
