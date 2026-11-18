import type { NextConfig } from 'next'
import configuration from '../next.config'

const configurationDesTestsDeComposants: NextConfig = {
  ...configuration,
  experimental: { ...configuration.experimental, externalDir: true },
}

export default configurationDesTestsDeComposants
