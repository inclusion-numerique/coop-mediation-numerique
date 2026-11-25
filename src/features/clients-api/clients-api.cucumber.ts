import assert from 'node:assert'
import { After, Given, setDefaultTimeout, Then } from '@cucumber/cucumber'
import type { NextRequest } from 'next/server'
import { v4 } from 'uuid'
import { z } from 'zod'
import { prismaClient } from '@/configuration/prisma'
import {
  type ClientApiId,
  NomDuClientApi,
  PorteeApi,
} from '@/features/clients-api/domain'
import { verifySecret } from '@/features/clients-api/implementations/secret/hash-secret.adapter'
import { createTestApiV1Request } from '@/libraries/json-api'
import { creerUnClientApi } from './abilities/creer-un-client-api/implementations/prisma/creer-un-client-api.mutation'

setDefaultTimeout(60_000)

const execution = v4().slice(0, 8)

export const nomUnique = (nom: string): NomDuClientApi =>
  NomDuClientApi(`${nom} ${execution}`)

export const jour = (date: string): Date => {
  const [j, m, a] = date.split('/')
  return new Date(Date.UTC(Number(a), Number(m) - 1, Number(j)))
}

export const portees = (liste: string): PorteeApi[] =>
  liste.split(',').map((portee) => PorteeApi(portee.trim()))

type ClientSeme = { readonly id: ClientApiId; readonly secret: string }

const semes = new Map<string, ClientSeme>()

export const clientSeme = (nom: string): ClientSeme => {
  const seme = semes.get(nom)
  if (seme === undefined) throw new Error(`Aucun client API semé : ${nom}`)
  return seme
}

export const retenirLeClient = (nom: string, seme: ClientSeme) => {
  semes.set(nom, seme)
}

export const semerUnClientApi = async ({
  nom,
  liste = 'Activites',
  debut = '01/01/2026',
  fin = null,
}: {
  nom: string
  liste?: string
  debut?: string
  fin?: string | null
}): Promise<ClientSeme> => {
  const creation = await creerUnClientApi({
    nom: nomUnique(nom),
    portees: portees(liste),
    validite: { debut: jour(debut), fin: fin === null ? null : jour(fin) },
  })
  if (!creation.success) throw new Error(`Client API non semé : ${nom}`)
  const seme = { id: creation.data.client.id, secret: creation.data.secret }
  retenirLeClient(nom, seme)
  return seme
}

export const leSecretOuvreLAcces = async (
  clientApiId: string,
  secret: string,
): Promise<boolean> => {
  const { secretHash } = await prismaClient.apiClient.findUniqueOrThrow({
    where: { id: clientApiId },
    select: { secretHash: true },
  })
  return verifySecret(secret, secretHash)
}

Given('un client API {string}', async (nom: string) => {
  await semerUnClientApi({ nom })
})

Given(
  'un client API {string} avec les permissions {string}',
  async (nom: string, liste: string) => {
    await semerUnClientApi({ nom, liste })
  },
)

const domaineDesComptesSemes = `@clients-api-${execution}.cucumber.example`

export const semerUneActiviteModifieeLe = async (
  modification: string,
): Promise<string> => {
  const { id } = await prismaClient.activite.create({
    data: {
      type: 'Individuel',
      typeLieu: 'Autre',
      date: new Date('2026-06-01'),
      duree: 60,
      modification: jour(modification),
      mediateur: {
        create: {
          user: { create: { email: `${v4()}${domaineDesComptesSemes}` } },
        },
      },
    },
    select: { id: true },
  })
  return id
}

type RouteDeLApi = (request: NextRequest) => Promise<Response>

type ReponseDeLApi = { readonly statut: number; readonly corps: unknown }

const derniereReponse: { reponse?: ReponseDeLApi } = {}

const reponse = (): ReponseDeLApi => {
  assert.ok(derniereReponse.reponse, "L'API n'a pas été appelée")
  return derniereReponse.reponse
}

const appelerLAdresse = async (
  route: RouteDeLApi,
  url: string,
  client: string | null,
): Promise<void> => {
  const reponseHttp = await route(
    createTestApiV1Request({
      url,
      method: 'GET',
      ...(client === null ? {} : { client: clientSeme(client) }),
    }),
  )
  derniereReponse.reponse = {
    statut: reponseHttp.status,
    corps: await reponseHttp.json(),
  }
}

export const appelerLApi = async ({
  route,
  chemin,
  requete = '',
  client,
}: {
  route: RouteDeLApi
  chemin: string
  requete?: string
  client: string | null
}): Promise<void> =>
  appelerLAdresse(route, `/api/v1${chemin}?${requete}`, client)

const ListeJsonApi = z.object({
  data: z.array(z.object({ id: z.string() })),
  links: z.object({
    self: z.object({ href: z.string() }),
    next: z.object({ href: z.string() }).optional(),
  }),
  meta: z.object({ total_count: z.number(), items_per_page: z.number() }),
})

const listeLue = () => ListeJsonApi.parse(reponse().corps)

export const identifiantsLus = (): readonly string[] =>
  listeLue().data.map(({ id }) => id)

export const suivreLaPageSuivante = async (
  route: RouteDeLApi,
  client: string,
): Promise<void> => {
  const suivante = listeLue().links.next
  assert.ok(suivante, "La réponse n'annonce pas de page suivante")
  const { pathname, search } = new URL(suivante.href)
  await appelerLAdresse(route, `${pathname}${search}`, client)
}

Then("l'API demande de s'authentifier", () => {
  assert.strictEqual(reponse().statut, 401)
})

Then("l'API refuse l'accès", () => {
  assert.strictEqual(reponse().statut, 403)
})

Then("l'API rejette la requête", () => {
  assert.strictEqual(reponse().statut, 400)
})

Then("l'API répond par une liste JSON:API", () => {
  assert.deepStrictEqual(
    {
      statut: reponse().statut,
      liste: ListeJsonApi.safeParse(reponse().corps).success,
    },
    { statut: 200, liste: true },
  )
})

Then("l'API répond par la ressource JSON:API {string}", (type: string) => {
  assert.deepStrictEqual(
    {
      statut: reponse().statut,
      type: z
        .object({ data: z.object({ type: z.string() }) })
        .safeParse(reponse().corps).data?.data.type,
    },
    { statut: 200, type },
  )
})

Then("l'API répond par un tableau de {int} élément(s)", (taille: number) => {
  assert.deepStrictEqual(
    {
      statut: reponse().statut,
      taille: z.array(z.unknown()).safeParse(reponse().corps).data?.length,
    },
    { statut: 200, taille },
  )
})

Then("l'API répond par l'état {string}", (etat: string) => {
  assert.deepStrictEqual(
    { statut: reponse().statut, corps: reponse().corps },
    { statut: 200, corps: { status: etat } },
  )
})

Then('la page lue contient {int} élément(s)', (taille: number) => {
  assert.strictEqual(listeLue().data.length, taille)
})

Then('la page lue annonce {int} élément(s) par page', (taille: number) => {
  assert.strictEqual(listeLue().meta.items_per_page, taille)
})

Then('la page lue annonce un total de {int} élément(s)', (total: number) => {
  assert.strictEqual(listeLue().meta.total_count, total)
})

Then('la page lue annonce une page suivante', () => {
  assert.ok(listeLue().links.next)
})

After(async () => {
  semes.clear()
  delete derniereReponse.reponse
  await prismaClient.apiClient.deleteMany({
    where: { name: { endsWith: ` ${execution}` } },
  })
  await prismaClient.activite.deleteMany({
    where: {
      mediateur: { user: { email: { endsWith: domaineDesComptesSemes } } },
    },
  })
  await prismaClient.mediateur.deleteMany({
    where: { user: { email: { endsWith: domaineDesComptesSemes } } },
  })
  await prismaClient.user.deleteMany({
    where: { email: { endsWith: domaineDesComptesSemes } },
  })
})
