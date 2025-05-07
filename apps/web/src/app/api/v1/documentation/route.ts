import { ApiReference } from '@scalar/nextjs-api-reference'

const config = {
  spec: {
    url: '/api/v1/openapi',
  },
}

export const GET = ApiReference(config)
