import assert from 'node:assert'
import {
  type ActivitesDeCoordinationListees,
  listerLesActivitesDeCoordination,
  type OptionsDeFiltre,
  optionsDeFiltre,
} from '@app/web/features/activites/abilities/lister-les-activites-de-coordination'
import {
  coordinationsSemees,
  semerDesCoordinations,
} from '@app/web/features/activites/activites.cucumber'
import {
  CoordinateurId,
  criteresDesCoordinations,
  type ParametresDesCoordinations,
} from '@app/web/features/activites/domain'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { Given, Then, When } from '@cucumber/cucumber'

let listees: ActivitesDeCoordinationListees | undefined
let options: OptionsDeFiltre | undefined

const lister = async (
  parametres: ParametresDesCoordinations,
  page = 1,
  lignesParPage = 50,
) => {
  listees = await listerLesActivitesDeCoordination({
    coordinateurId: CoordinateurId(coordinationsSemees().coordinateurId),
    criteres: criteresDesCoordinations(parametres),
    page,
    lignesParPage,
  })
}

Given('des activités de coordination enregistrées', async () => {
  listees = undefined
  options = undefined
  await semerDesCoordinations()
})

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
    options = await optionsDeFiltre({
      coordinateurId: CoordinateurId(coordinationsSemees().coordinateurId),
    })
  },
)

Then('{int} activités de coordination sont listées', (attendu: number) => {
  assert.strictEqual(listees?.activites.length, attendu)
})

Then(
  '{int} activités de coordination sont comptées sur {int} pages',
  (total: number, pages: number) => {
    assert.strictEqual(listees?.total, total)
    assert.strictEqual(listees?.pages, pages)
  },
)

Then('les types listés sont {string}', (attendus: string) => {
  assert.strictEqual(
    listees?.activites.map(({ _tag }) => _tag).join(', '),
    attendus,
  )
})

Then('{int} tags sont proposés', (attendu: number) => {
  assert.strictEqual(options?.tags.length, attendu)
})

Then(
  'la période couverte va du {string} au {string}',
  (du: string, au: string) => {
    const periode = options?.periodeCouverte
    assert.deepStrictEqual(
      periode == null
        ? null
        : [dateAsIsoDay(periode.du), dateAsIsoDay(periode.au)],
      [du, au],
    )
  },
)
