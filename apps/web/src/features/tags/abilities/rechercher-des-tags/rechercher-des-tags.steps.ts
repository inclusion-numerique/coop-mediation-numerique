import assert from 'node:assert'
import { type Acteur, type Tag, TagId } from '@app/web/features/tags/domain'
import {
  acteurMediateur,
  semerUneActiviteTaguee,
  semerUnMediateur,
  semerUnTag,
} from '@app/web/features/tags/tags.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import { rechercherDesTags } from './implementation'

const contexte: {
  acteur?: Acteur
  mediateurId?: string
  tagIds: Map<string, string>
  proposes?: readonly Tag[]
} = { tagIds: new Map() }

const valeur = <T>(valeur: T | undefined): T => {
  assert.ok(valeur)
  return valeur
}

const noms = (): readonly string[] =>
  valeur(contexte.proposes).map(({ nom }) => nom)

const chercher = async (recherche: string, exclus: readonly string[]) => {
  contexte.proposes = await rechercherDesTags({
    acteur: valeur(contexte.acteur),
    recherche,
    exclus: exclus.map((nom) => TagId(valeur(contexte.tagIds.get(nom)))),
    limite: 1000,
  })
}

Given(
  'un médiateur qui cherche parmi ses tags {string} et {string}',
  async (premier: string, second: string) => {
    const { mediateurId } = await semerUnMediateur()
    contexte.mediateurId = mediateurId
    contexte.acteur = acteurMediateur({ mediateurId })
    contexte.tagIds = new Map(
      await Promise.all(
        [premier, second].map(
          async (nom) => [nom, await semerUnTag({ nom, mediateurId })] as const,
        ),
      ),
    )
  },
)

Given('le tag personnel {string} d’un autre médiateur', async (nom: string) => {
  const { mediateurId } = await semerUnMediateur()
  await semerUnTag({ nom, mediateurId })
})

Given(
  'ce médiateur a utilisé {string} dans une activité',
  async (nom: string) => {
    await semerUneActiviteTaguee({
      mediateurId: valeur(contexte.mediateurId),
      tagIds: [valeur(contexte.tagIds.get(nom))],
    })
  },
)

When(
  'ce médiateur cherche {string} sans exclure de tag',
  async (recherche: string) => {
    await chercher(recherche, [])
  },
)

When(
  'ce médiateur cherche {string} en excluant {string}',
  async (recherche: string, exclu: string) => {
    await chercher(recherche, [exclu])
  },
)

Then(
  'la recherche de tags propose {string} et {string}',
  (premier: string, second: string) => {
    assert.ok(noms().includes(premier))
    assert.ok(noms().includes(second))
  },
)

Then('la recherche de tags propose {string}', (nom: string) => {
  assert.ok(noms().includes(nom))
})

Then('la recherche de tags ne propose pas {string}', (nom: string) => {
  assert.ok(!noms().includes(nom))
})

Then(
  '{string} est proposé avant {string}',
  (premier: string, second: string) => {
    assert.ok(noms().indexOf(premier) < noms().indexOf(second))
    assert.ok(noms().indexOf(premier) >= 0)
  },
)
