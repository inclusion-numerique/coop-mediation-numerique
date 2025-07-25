import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import type { Rdv } from '@app/web/rdv-service-public/Rdv'
import { createCraDataFromRdv } from '@app/web/rdv-service-public/createCraDataFromRdv'
import {
  type EncodedState,
  decodeSerializableState,
  encodeSerializableState,
} from '@app/web/utils/encodeSerializableState'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

/**
 * This route creates cra form data from a rdv and redirect to the cra form
 */

export const GET = async (request: NextRequest) => {
  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!user || !user.mediateur) {
    return new Response('Unauthorized', { status: 401 })
  }

  const rdvSerialized = request.nextUrl.searchParams.get('rdv') as
    | EncodedState<Rdv>
    | undefined

  if (!rdvSerialized) {
    return new Response('Not found', { status: 404 })
  }

  const rdv = decodeSerializableState(rdvSerialized, null)

  if (!rdv) {
    return new Response('Not found', { status: 404 })
  }

  const craData = await createCraDataFromRdv({
    rdv,
    mediateurId: user.mediateur.id,
  })

  return redirect(
    `/coop/mes-activites/cra/individuel?v=${encodeSerializableState(craData)}`,
  )
}

export default () => null
