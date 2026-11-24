import assert from 'node:assert'
import { Page, PageSize, Sort } from '@arckit/resultset'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { Acteur } from '@/features/tags/domain'
import {
  acteurMediateur,
  coordonner,
  semerUnCoordinateur,
  semerUneActiviteDeCoordinationTaguee,
  semerUneActiviteTaguee,
  semerUnMediateur,
  semerUnTag,
} from '@/features/tags/tags.cucumber'
import type { ListeDesTags } from './domain/index'
import { listerLesTags } from './implementations/prisma/lister-les-tags.query'

const contexte: {
  acteur?: Acteur
  mediateurId?: string
  coordinateurId?: string
  tagId?: string
  liste?: ListeDesTags
} = {}

const valeur = <T>(valeur: T | undefined): T => {
  assert.ok(valeur)
  return valeur
}

const nomsListes = (): readonly string[] =>
  valeur(contexte.liste).items.map(({ tag }) => tag.nom)

Given(
  'un médiateur coordonné du {int} qui consulte ses tags',
  async (departement: number) => {
    const { mediateurId } = await semerUnMediateur()
    const { coordinateurId } = await semerUnCoordinateur()
    await coordonner({ coordinateurId, mediateurId })
    contexte.mediateurId = mediateurId
    contexte.coordinateurId = coordinateurId
    contexte.acteur = acteurMediateur({
      mediateurId,
      equipes: [coordinateurId],
      departement: String(departement).padStart(2, '0'),
    })
  },
)

Given('son tag personnel {string}', async (nom: string) => {
  contexte.tagId = await semerUnTag({
    nom,
    mediateurId: valeur(contexte.mediateurId),
  })
})

Given('le tag {string} de son équipe', async (nom: string) => {
  await semerUnTag({
    nom,
    coordinateurId: valeur(contexte.coordinateurId),
    equipe: true,
  })
})

Given(
  'le tag départemental {string} du {string}',
  async (nom: string, departement: string) => {
    await semerUnTag({ nom, departement })
  },
)

Given("le tag personnel {string} d'un autre médiateur", async (nom: string) => {
  const { mediateurId } = await semerUnMediateur()
  await semerUnTag({ nom, mediateurId })
})

Given('son tag personnel {string} marqué supprimé', async (nom: string) => {
  const tagId = await semerUnTag({
    nom,
    mediateurId: valeur(contexte.mediateurId),
  })
  await prismaClient.tag.update({
    where: { id: tagId },
    data: { suppression: new Date() },
  })
})

Given(
  'ce tag porté par deux activités de {int} et {int} accompagnements',
  async (premiere: number, seconde: number) => {
    const mediateurId = valeur(contexte.mediateurId)
    const tagIds = [valeur(contexte.tagId)]
    await semerUneActiviteTaguee({
      mediateurId,
      tagIds,
      accompagnements: premiere,
    })
    await semerUneActiviteTaguee({
      mediateurId,
      tagIds,
      accompagnements: seconde,
    })
  },
)

Given('ce tag porté par une activité de coordination', async () => {
  await semerUneActiviteDeCoordinationTaguee({
    coordinateurId: valeur(contexte.coordinateurId),
    tagIds: [valeur(contexte.tagId)],
  })
})

When('ce médiateur liste ses tags', async () => {
  contexte.liste = await listerLesTags({
    acteur: valeur(contexte.acteur),
    tri: Sort('nom', 'asc'),
    page: Page(1),
    pageSize: PageSize(100_000),
  })
})

Then(
  'la liste contient {string}, {string} et {string}',
  (premier: string, deuxieme: string, troisieme: string) => {
    const noms = nomsListes()
    assert.ok(noms.includes(premier))
    assert.ok(noms.includes(deuxieme))
    assert.ok(noms.includes(troisieme))
  },
)

Then(
  'la liste ne contient ni {string}, ni {string}, ni {string}',
  (premier: string, deuxieme: string, troisieme: string) => {
    const noms = nomsListes()
    assert.ok(!noms.includes(premier))
    assert.ok(!noms.includes(deuxieme))
    assert.ok(!noms.includes(troisieme))
  },
)

Then('le total annoncé correspond aux tags listés', () => {
  assert.strictEqual(valeur(contexte.liste).totalItems, nomsListes().length)
})

Then(
  'le tag {string} compte {int} accompagnements',
  (nom: string, accompagnements: number) => {
    assert.strictEqual(
      valeur(contexte.liste).items.find(({ tag }) => tag.nom === nom)
        ?.accompagnements,
      accompagnements,
    )
  },
)
