import { routeBuilder } from '@arckit/nextjs/route'
import { NextResponse } from 'next/server'
import {
  withApiV1Errors,
  withClientApi,
  withQueryParams,
} from '@/features/clients-api/abilities/authentifier-un-client-api/implementation/api-v1'
import { apiDisponible } from '@/features/clients-api/abilities/verifier-l-etat-de-l-api'
import { NoQueryParamsValidation } from '@/libraries/json-api/ApiV1QueryParams'

/**
 * @openapi
 * /health:
 *   get:
 *     summary: health
 *     description: Returns the server status info in JSON format.
 *     tags:
 *       - Utilitaires
 *     responses:
 *       200:
 *         description: API status message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
export const GET = routeBuilder()
  .use(withClientApi([]))
  .use(withQueryParams(NoQueryParamsValidation))
  .handle(withApiV1Errors(async () => NextResponse.json(apiDisponible())))
