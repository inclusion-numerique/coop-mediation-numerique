import {
  type ClientApiId,
  NomDuClientApi,
  PorteeApi,
} from '@app/web/features/clients-api/domain'
import { prismaClient } from '@app/web/prismaClient'
import { verifySecret } from '@app/web/security/hashSecret'
import { After, Given, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { creerUnClientApi } from './abilities/creer-un-client-api'

setDefaultTimeout(60_000)

const execution = v4().slice(0, 8)

export const nomUnique = (nom: string): NomDuClientApi =>
  NomDuClientApi(`${nom} ${execution}`)

export const jour = (date: string): Date => {
  const [j, m, a] = date.split('/').map(Number)
  return new Date(Date.UTC(a, m - 1, j))
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

After(async () => {
  semes.clear()
  await prismaClient.apiClient.deleteMany({
    where: { name: { endsWith: ` ${execution}` } },
  })
})
