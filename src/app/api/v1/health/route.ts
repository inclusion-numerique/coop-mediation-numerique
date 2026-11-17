import { NoQueryParamsValidation } from '@app/web/app/api/v1/ApiV1QueryParams'
import {
  withApiV1Errors,
  withClientApi,
  withQueryParams,
} from '@app/web/app/api/v1/middlewares'
import { routeBuilder } from '@arckit/nextjs/route'
import { NextResponse } from 'next/server'

export type HealthResponse = {
  status: 'ok' | 'error'
}

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
  .handle(
    withApiV1Errors(async () =>
      NextResponse.json({ status: 'ok' } satisfies HealthResponse),
    ),
  )
