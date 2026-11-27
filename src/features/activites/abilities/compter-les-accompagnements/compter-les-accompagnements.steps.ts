import assert from 'node:assert'
import { type DataTable, Then, When } from '@cucumber/cucumber'
import {
  demandeDeStatistiques,
  parametresDuTableau,
} from '../../statistiques.cucumber'
import {
  anonymes,
  compterLesAccompagnements,
  type TotauxDesAccompagnements,
} from './domain/index'
import {
  activitesComptees,
  nouvellesPersonnesComptees,
  personnesComptees,
} from './implementations/prisma/totaux-des-accompagnements.query'

const compter = compterLesAccompagnements({
  activitesComptees,
  personnesComptees,
  nouvellesPersonnesComptees,
})

const etat: {
  totaux?: TotauxDesAccompagnements
} = {}

const comptes = (): TotauxDesAccompagnements => {
  assert.ok(etat.totaux, 'Aucun compte')
  return etat.totaux
}

When('je compte les accompagnements de {string}', async (nom: string) => {
  etat.totaux = (await compter(demandeDeStatistiques(nom))).data
})

When(
  'je compte les accompagnements de {string} avec :',
  async (nom: string, criteres: DataTable) => {
    etat.totaux = (
      await compter(demandeDeStatistiques(nom, parametresDuTableau(criteres)))
    ).data
  },
)

Then(
  /^les activités comptées sont (\d+) dont (\d+) individuelles? et (\d+) collectives?$/,
  (total: string, individuelles: string, collectives: string) => {
    assert.deepStrictEqual(comptes().activites, {
      total: Number(total),
      individuelles: Number(individuelles),
      collectives: Number(collectives),
    })
  },
)

Then(
  'les accompagnements comptés sont {int} dont {int} collectifs',
  (total: number, collectifs: number) => {
    assert.deepStrictEqual(comptes().accompagnements, { total, collectifs })
  },
)

Then(
  /^les personnes comptées sont (\d+) dont (\d+) suivies? et (\d+) anonymes?$/,
  (total: string, suivies: string, anonymesAttendues: string) => {
    assert.deepStrictEqual(
      [
        comptes().personnes.total,
        comptes().personnes.suivies,
        anonymes(comptes()),
      ],
      [Number(total), Number(suivies), Number(anonymesAttendues)],
    )
  },
)

Then('les nouvelles personnes comptées sont {int}', (nouvelles: number) => {
  assert.strictEqual(comptes().personnes.nouvelles, nouvelles)
})
