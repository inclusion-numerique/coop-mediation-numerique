import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

const reponseDErreur = (error: unknown): Response => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0].message },
      { status: 400 },
    )
  }

  Sentry.captureException(error)

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export const withApiV1Errors =
  <Ctx extends object>(handler: (ctx: Ctx) => Promise<Response>) =>
  async (ctx: Ctx): Promise<Response> =>
    handler(ctx).catch(reponseDErreur)
