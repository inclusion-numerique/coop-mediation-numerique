import type { NextRequest } from 'next/server'
import openapiDoc from '@/features/clients-api/implementations/openapi/v1.openapi.json'

/**
 * Open API specification in JSON format, publicly available
 */
export const GET = (_request: NextRequest) =>
  new Response(JSON.stringify(openapiDoc), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
