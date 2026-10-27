import assert from 'node:assert'
import { semerUnAccompagnementDansLaCommune } from '@app/web/features/activites/activites.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import { Jour, PopulationDeMediateurs } from './domain'
import { accompagnementsParDepartement } from './implementation'

const AJACCIO = '2A004'
const CORSE_DU_SUD = '2A'
const FIN_SEPTEMBRE = Jour('2026-09-30')

const exportation: { avant?: number; apres?: number } = {}

const accompagnementsDeMediateursEnCorseDuSud = async (
  jusquAu: Jour | null,
): Promise<number> =>
  (
    await accompagnementsParDepartement({
      population: PopulationDeMediateurs('AutresMediateurs'),
      jusquAu,
    })
  ).find(({ departement }) => departement.code === CORSE_DU_SUD)
    ?.accompagnements ?? 0

Given(
  'le décompte des accompagnements de médiateurs en Corse-du-Sud',
  async () => {
    exportation.avant = await accompagnementsDeMediateursEnCorseDuSud(null)
  },
)

Given(
  "le décompte des accompagnements de médiateurs en Corse-du-Sud jusqu'au 30 septembre 2026",
  async () => {
    exportation.avant =
      await accompagnementsDeMediateursEnCorseDuSud(FIN_SEPTEMBRE)
  },
)

Given(
  'un accompagnement réalisé par un médiateur à Ajaccio le 1er octobre 2026',
  async () => {
    await semerUnAccompagnementDansLaCommune({
      codeInsee: AJACCIO,
      date: new Date('2026-10-01'),
    })
  },
)

When("l'administration exporte les accompagnements", async () => {
  exportation.apres = await accompagnementsDeMediateursEnCorseDuSud(null)
})

When(
  "l'administration exporte les accompagnements jusqu'au 30 septembre 2026",
  async () => {
    exportation.apres =
      await accompagnementsDeMediateursEnCorseDuSud(FIN_SEPTEMBRE)
  },
)

Then(
  'la Corse-du-Sud compte {int} accompagnement de médiateur de plus',
  (attendu: number) => {
    assert.ok(exportation.avant !== undefined, 'Décompte initial manquant')
    assert.strictEqual(exportation.apres, exportation.avant + attendu)
  },
)
