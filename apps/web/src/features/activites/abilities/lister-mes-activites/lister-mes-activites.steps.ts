import assert from 'node:assert'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import {
  type ChronologieDesActivites,
  contenuDeLaChronologie,
  criteresDesActivites,
  MediateurId,
  ordreChronologiqueLu,
  paginationLue,
} from '../../domain'
import { listerMesActivites } from './implementation'

type Semis = { readonly userIds: string[]; readonly mediateurId: string }

let semis: Semis | undefined
let chronologie: ChronologieDesActivites | undefined

const semerUnMediateur = async (): Promise<{
  userId: string
  mediateurId: string
}> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `mes-activites-${userId}@example.com` },
  })
  const { id } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  return { userId, mediateurId: id }
}

const semerUneActivite = (
  mediateurId: string,
  date: Date,
  type: 'Individuel' | 'Collectif',
) =>
  prismaClient.activite.create({
    data: {
      mediateurId,
      type,
      typeLieu: 'ADistance',
      date,
      duree: 60,
      thematiques: ['Email'],
      accompagnementsCount: 1,
      accompagnements: {
        create: {
          beneficiaire: { create: { mediateurId, anonyme: true } },
        },
      },
    },
    select: { id: true },
  })

const semisCourant = (): Semis => {
  if (!semis) throw new Error('Aucun médiateur semé')
  return semis
}

const MARS = { 3: 'Individuel', 5: 'Collectif', 9: 'Individuel' } as const

Given(
  'un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026',
  async () => {
    const { userId, mediateurId } = await semerUnMediateur()
    semis = { userIds: [userId], mediateurId }
    await Promise.all(
      Object.entries(MARS).map(([jour, type]) =>
        semerUneActivite(
          mediateurId,
          new Date(Date.UTC(2026, 2, Number(jour))),
          type,
        ),
      ),
    )
  },
)

Given('son activité du 5 mars 2026 est supprimée', async () => {
  await prismaClient.activite.updateMany({
    where: {
      mediateurId: semisCourant().mediateurId,
      date: new Date(Date.UTC(2026, 2, 5)),
    },
    data: { suppression: new Date() },
  })
})

Given(
  'un autre médiateur a enregistré une activité le 7 mars 2026',
  async () => {
    const autre = await semerUnMediateur()
    semis = {
      ...semisCourant(),
      userIds: [...semisCourant().userIds, autre.userId],
    }
    await semerUneActivite(
      autre.mediateurId,
      new Date(Date.UTC(2026, 2, 7)),
      'Individuel',
    )
  },
)

Given(
  'un médiateur ayant enregistré {int} activités en avril 2026',
  async (nombre: number) => {
    const { userId, mediateurId } = await semerUnMediateur()
    semis = { userIds: [userId], mediateurId }
    await Promise.all(
      Array.from({ length: nombre }, (_, rang) =>
        semerUneActivite(
          mediateurId,
          new Date(Date.UTC(2026, 3, rang + 1)),
          'Individuel',
        ),
      ),
    )
  },
)

Given(
  'un médiateur ayant accompagné le 3 mars 2026 un bénéficiaire de Nice, anonymisé depuis',
  async () => {
    const { userId, mediateurId } = await semerUnMediateur()
    semis = { userIds: [userId], mediateurId }
    await prismaClient.activite.create({
      data: {
        mediateurId,
        type: 'Individuel',
        typeLieu: 'ADistance',
        date: new Date(Date.UTC(2026, 2, 3)),
        duree: 60,
        thematiques: ['Email'],
        accompagnementsCount: 1,
        accompagnements: {
          create: {
            beneficiaire: {
              create: {
                mediateurId,
                anonyme: true,
                suppression: new Date(),
                commune: 'Nice',
                communeCodePostal: '06100,06000,06200,06300',
                communeCodeInsee: '06088',
              },
            },
          },
        },
      },
    })
  },
)

const lister = async (parametres: Record<string, string>) => {
  const criteres = criteresDesActivites(parametres)
  chronologie = await listerMesActivites({
    mediateurId: MediateurId(semisCourant().mediateurId),
    criteres,
    pagination: paginationLue(parametres),
    ordre: ordreChronologiqueLu(parametres.ordre),
    contenu: contenuDeLaChronologie(criteres, { _tag: 'NonConnecte' }),
    rendezVous: null,
    rendezVousLies: () => Promise.resolve([]),
    conseillersNumeriques: conseillerNumeriqueSql,
  })
}

When('je liste mes activités', async () => {
  await lister({})
})

When('je liste mes activités avec {string}', async (requete: string) => {
  await lister(Object.fromEntries(new URLSearchParams(requete)))
})

const jourEnFrancais = (jour: string): string => {
  const date = new Date(`${jour}T00:00:00.000Z`)
  return `${date.getUTCDate()} ${new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' }).format(date)}`
}

Then('les activités listées sont celles du {string}', (attendues: string) => {
  assert.strictEqual(
    chronologie?.elements
      .flatMap((element) =>
        element._tag === 'Activite'
          ? [jourEnFrancais(element.activite.activite.date)]
          : [],
      )
      .join(', '),
    attendues,
  )
})

Then(
  '{int} activités sont comptées sur {int} page(s)',
  (activites: number, pages: number) => {
    assert.deepStrictEqual(
      [chronologie?.total.activites, chronologie?.pages],
      [activites, pages],
    )
  },
)

Then('{int} activités sont listées', (attendu: number) => {
  assert.strictEqual(chronologie?.elements.length, attendu)
})

After(async () => {
  const seme = semis
  semis = undefined
  chronologie = undefined
  if (!seme) return
  const mediateurs = await prismaClient.mediateur.findMany({
    where: { userId: { in: seme.userIds } },
    select: { id: true },
  })
  const mediateurIds = mediateurs.map(({ id }) => id)
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: seme.userIds } } })
})
