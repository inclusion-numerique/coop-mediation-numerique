import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { type Acteur, type Tag, TagId } from '@/features/tags/domain'
import {
  acteurMediateur,
  semerUneActiviteTaguee,
  semerUnMediateur,
  semerUnTag,
} from '@/features/tags/tags.cucumber'
import { rechercherDesTags } from './implementations/prisma/rechercher-des-tags.query'
import { tagsInitiauxAvec } from './implementations/prisma/tags-initiaux-par.query'

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

const chercher = async (
  recherche: string,
  exclus: readonly string[],
  limite = 1000,
) => {
  contexte.proposes = await rechercherDesTags({
    acteur: valeur(contexte.acteur),
    recherche,
    exclus: exclus.map((nom) => TagId(valeur(contexte.tagIds.get(nom)))),
    limite,
  })
}

const tagNumero = (numero: number): string =>
  `Tag ${String(numero).padStart(2, '0')}`

const semerDesTags = async (
  noms: readonly string[],
  mediateurId: string,
): Promise<Map<string, string>> =>
  new Map(
    await Promise.all(
      noms.map(
        async (nom) => [nom, await semerUnTag({ nom, mediateurId })] as const,
      ),
    ),
  )

Given(
  'un médiateur qui cherche parmi ses tags {string} et {string}',
  async (premier: string, second: string) => {
    const { mediateurId } = await semerUnMediateur()
    contexte.mediateurId = mediateurId
    contexte.acteur = acteurMediateur({ mediateurId })
    contexte.tagIds = await semerDesTags([premier, second], mediateurId)
  },
)

Given(
  'un médiateur qui a {int} tags, de {string} à {string}',
  async (nombre: number, premier: string, dernier: string) => {
    const noms = Array.from({ length: nombre }, (_, index) =>
      tagNumero(index + 1),
    )
    assert.deepStrictEqual([noms.at(0), noms.at(-1)], [premier, dernier])
    const { mediateurId } = await semerUnMediateur()
    contexte.mediateurId = mediateurId
    contexte.acteur = acteurMediateur({ mediateurId })
    contexte.tagIds = await semerDesTags(noms, mediateurId)
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

When(
  'ce médiateur ouvre la liste de ses tags, limitée à {int}',
  async (limite: number) => {
    contexte.proposes = await tagsInitiauxAvec(
      () => (tag: Tag) => tag,
      limite,
    )(valeur(contexte.acteur))([])
  },
)

When(
  'ce médiateur cherche {string} parmi au plus {int} tags',
  async (recherche: string, limite: number) => {
    await chercher(recherche, [], limite)
  },
)

Then('la recherche de tags propose {int} tags', (nombre: number) => {
  assert.strictEqual(noms().length, nombre)
})

Then('{string} est proposé en premier', (nom: string) => {
  assert.strictEqual(noms().at(0), nom)
})

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
