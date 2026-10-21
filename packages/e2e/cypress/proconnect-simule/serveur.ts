import { createHmac, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createServer } from 'node:https'
import identite from './identite.json' with { type: 'json' }

const port = Number(process.env.PROCONNECT_SIMULE_PORT ?? 8443)
const issuer = `https://localhost:${port}`

const base64url = (contenu: string | Buffer): string =>
  Buffer.from(contenu).toString('base64url')

const jwt = (charge: Record<string, unknown>): string => {
  const entete = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const corps = base64url(JSON.stringify(charge))
  const signature = createHmac('sha256', 'proconnect-simule')
    .update(`${entete}.${corps}`)
    .digest('base64url')
  return `${entete}.${corps}.${signature}`
}

const revendications = (clientId: string) => {
  const maintenant = Math.floor(Date.now() / 1000)
  return {
    ...identite,
    iss: issuer,
    aud: clientId,
    iat: maintenant,
    exp: maintenant + 3600,
  }
}

const corpsDe = (requete: IncomingMessage): Promise<URLSearchParams> =>
  new Promise((resoudre) => {
    const morceaux: Buffer[] = []
    requete.on('data', (morceau: Buffer) => morceaux.push(morceau))
    requete.on('end', () =>
      resoudre(new URLSearchParams(Buffer.concat(morceaux).toString())),
    )
  })

const rediriger = (reponse: ServerResponse, vers: URL) => {
  reponse.writeHead(302, { location: vers.toString() })
  reponse.end()
}

const autoriser = (parametres: URLSearchParams, reponse: ServerResponse) => {
  const retour = new URL(parametres.get('redirect_uri') ?? '')
  retour.searchParams.set('code', randomUUID())
  retour.searchParams.set('state', parametres.get('state') ?? '')
  retour.searchParams.set('iss', issuer)
  rediriger(reponse, retour)
}

const delivrerLesJetons = async (
  requete: IncomingMessage,
  reponse: ServerResponse,
) => {
  const clientId = (await corpsDe(requete)).get('client_id') ?? ''
  reponse.writeHead(200, { 'content-type': 'application/json' })
  reponse.end(
    JSON.stringify({
      access_token: randomUUID(),
      refresh_token: randomUUID(),
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid given_name usual_name email phone siret',
      id_token: jwt(revendications(clientId)),
    }),
  )
}

const decrireLUtilisateur = (reponse: ServerResponse) => {
  reponse.writeHead(200, { 'content-type': 'application/jwt' })
  reponse.end(jwt(revendications('proconnect-simule')))
}

const terminerLaSession = (
  parametres: URLSearchParams,
  reponse: ServerResponse,
) =>
  rediriger(reponse, new URL(parametres.get('post_logout_redirect_uri') ?? ''))

const repondre = (requete: IncomingMessage, reponse: ServerResponse) => {
  const url = new URL(requete.url ?? '/', issuer)
  const route = `${requete.method} ${url.pathname}`

  if (route === 'GET /api/v2/authorize')
    return autoriser(url.searchParams, reponse)
  if (route === 'POST /api/v2/token') return delivrerLesJetons(requete, reponse)
  if (route === 'GET /api/v2/userinfo') return decrireLUtilisateur(reponse)
  if (route === 'GET /api/v2/session/end')
    return terminerLaSession(url.searchParams, reponse)

  reponse.writeHead(404)
  reponse.end()
}

createServer(
  {
    cert: readFileSync(process.env.PROCONNECT_SIMULE_CERTIFICAT ?? ''),
    key: readFileSync(process.env.PROCONNECT_SIMULE_CLE ?? ''),
  },
  repondre,
).listen(port, () => console.log(`ProConnect simulé sur ${issuer}`))
