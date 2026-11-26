import assert from 'node:assert'
import { Page, PageSize } from '@arckit/resultset'
import { Given, Then, When } from '@cucumber/cucumber'
import {
  type ActivitesDeCoordinationListees,
  type OptionsDeFiltre,
} from '@/features/activites/abilities/lister-les-activites-de-coordination/domain/index'
import { listerLesActivitesDeCoordination } from '@/features/activites/abilities/lister-les-activites-de-coordination/implementations/prisma/activites-de-coordination.query'
import { optionsDeFiltre } from '@/features/activites/abilities/lister-les-activites-de-coordination/implementations/prisma/options-de-filtre.query'
import {
  coordinationsSemees,
  semerDesAnimationsDeJanvier,
  semerDesCoordinations,
} from '@/features/activites/activites.cucumber'
import { CoordinateurId } from '@/features/activites/domain'
import { criteresDesCoordinationsDepuisLURL } from '@/features/activites/fixtures/criteres-depuis-l-url'
import { dateAsIsoDay } from '@/libraries/date'

const etat: {
  listees?: ActivitesDeCoordinationListees
  options?: OptionsDeFiltre
} = {}

const lister = async (
  parametres: Parameters<typeof criteresDesCoordinationsDepuisLURL>[0],
  page = 1,
  lignesParPage = 50,
) => {
  etat.listees = await listerLesActivitesDeCoordination({
    coordinateurId: CoordinateurId(coordinationsSemees().coordinateurId),
    criteres: criteresDesCoordinationsDepuisLURL(parametres),
    pagination: {
      page: Page(page),
      pageSize: PageSize(lignesParPage),
    },
  })
}

Given('des activités de coordination enregistrées', async () => {
  delete etat.listees
  delete etat.options
  await semerDesCoordinations()
})

Given(
  '{int} animations de coordination de plus, en janvier 2026',
  async (nombre: number) => {
    await semerDesAnimationsDeJanvier(nombre)
  },
)

When('je liste mes activités de coordination', async () => {
  await lister({})
})

When(
  'je liste mes activités de coordination de type {string}',
  async (types: string) => {
    await lister({ types })
  },
)

When('je liste mes activités de coordination taguées « Élus »', async () => {
  await lister({ tags: coordinationsSemees().tags.elus })
})

When(
  'je liste mes activités de coordination du {string} au {string}',
  async (du: string, au: string) => {
    await lister({ du, au })
  },
)

When(
  'je liste la page {int} de mes activités de coordination, {int} par page',
  async (page: number, lignesParPage: number) => {
    await lister({}, page, lignesParPage)
  },
)

When(
  'je consulte les options de filtre de mes activités de coordination',
  async () => {
    etat.options = await optionsDeFiltre({
      coordinateurId: CoordinateurId(coordinationsSemees().coordinateurId),
    })
  },
)

Then('{int} activités de coordination sont listées', (attendu: number) => {
  assert.strictEqual(etat.listees?.activites.length, attendu)
})

Then(
  '{int} activités de coordination sont comptées sur {int} pages',
  (total: number, pages: number) => {
    assert.strictEqual(etat.listees?.total, total)
    assert.strictEqual(etat.listees?.pages, pages)
  },
)

Then('les types listés sont {string}', (attendus: string) => {
  assert.strictEqual(
    etat.listees?.activites.map(({ _tag }) => _tag).join(', '),
    attendus,
  )
})

Then('{int} tags sont proposés', (attendu: number) => {
  assert.strictEqual(etat.options?.tags.length, attendu)
})

Then(
  'la période couverte va du {string} au {string}',
  (du: string, au: string) => {
    const periode = etat.options?.periodeCouverte
    assert.deepStrictEqual(
      periode == null
        ? null
        : [dateAsIsoDay(periode.du), dateAsIsoDay(periode.au)],
      [du, au],
    )
  },
)
