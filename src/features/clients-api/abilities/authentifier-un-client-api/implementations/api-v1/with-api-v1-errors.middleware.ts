import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { signaler } from '@/configuration/telemetry/serveur'

const reponseDErreur = (error: unknown): Response => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? error.message },
      { status: 400 },
    )
  }

  signaler(error)

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export const withApiV1Errors =
  <Ctx extends object>(handler: (ctx: Ctx) => Promise<Response>) =>
  async (ctx: Ctx): Promise<Response> =>
    handler(ctx).catch(reponseDErreur)
