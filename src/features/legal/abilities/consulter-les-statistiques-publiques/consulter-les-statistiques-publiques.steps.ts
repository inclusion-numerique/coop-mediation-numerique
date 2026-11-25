import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import {
  type BeneficiaireAccompagne,
  type EtatDeLActivite,
  semerUneActivite,
} from '@/features/legal/legal.cucumber'
import { lireLesAccompagnements } from './implementations/prisma/accompagnements.query'
import { lireLesBeneficiaires } from './implementations/prisma/beneficiaires.query'

const relever = async () => {
  const [beneficiaires, accompagnements] = await Promise.all([
    lireLesBeneficiaires(),
    lireLesAccompagnements(),
  ])
  return { beneficiaires, accompagnements }
}

type Releve = Awaited<ReturnType<typeof relever>>

const releves: { avant?: Releve; apres?: Releve } = {}

const releve = (moment: keyof typeof releves): Releve => {
  const lu = releves[moment]
  assert.ok(lu, `Les statistiques publiques n'ont pas été relevées (${moment})`)
  return lu
}

const valeurDeLaSerie = (
  series: readonly { readonly key: string; readonly value: number }[],
  cle: string,
): number => {
  const serie = series.find(({ key }) => key === cle)
  assert.ok(serie, `Série inconnue : ${cle}`)
  return serie.value
}

const hausse = (
  lire: (releve: Releve) => readonly {
    readonly key: string
    readonly value: number
  }[],
  cle: string,
): number =>
  valeurDeLaSerie(lire(releve('apres')), cle) -
  valeurDeLaSerie(lire(releve('avant')), cle)

const cumulAttendu = <Mois extends { readonly mois: string }>(
  depart: Mois | undefined,
  parMois: readonly Mois[],
  ajouter: (cumul: Mois, mois: Mois) => Mois,
): readonly Mois[] =>
  depart === undefined
    ? []
    : parMois.reduce<{ dernier: Mois; cumuls: readonly Mois[] }>(
        ({ dernier, cumuls }, mois) => {
          const suivant = ajouter(dernier, mois)
          return { dernier: suivant, cumuls: [...cumuls, suivant] }
        },
        { dernier: depart, cumuls: [depart] },
      ).cumuls

const etats: Readonly<Record<string, EtatDeLActivite>> = {
  saisie: 'saisie',
  supprimée: 'supprimée',
  'importée de la v1': 'importée de la v1',
}

const accompagnements: Readonly<
  Record<string, readonly BeneficiaireAccompagne[]>
> = {
  'un bénéficiaire suivi': ['suivi'],
  'un bénéficiaire suivi et un bénéficiaire anonyme': ['suivi', 'anonyme'],
  'un bénéficiaire importé de la v1': ['importé de la v1'],
  'deux bénéficiaires anonymes': ['anonyme', 'anonyme'],
}

Given('les statistiques publiques relevées', async () => {
  releves.avant = await relever()
})

Given(
  /^une activité (saisie|supprimée|importée de la v1) qui accompagne (.+)$/,
  async (etat: string, accompagnes: string) => {
    const etatSeme = etats[etat]
    const accompagnesSemes = accompagnements[accompagnes]
    assert.ok(etatSeme && accompagnesSemes, `Inconnu : ${etat}, ${accompagnes}`)
    await semerUneActivite({ etat: etatSeme, accompagnes: accompagnesSemes })
  },
)

When('les statistiques publiques sont relevées à nouveau', async () => {
  releves.apres = await relever()
})

When('les statistiques publiques sont relevées', async () => {
  releves.apres = await relever()
})

Then('les bénéficiaires suivis ont augmenté de {int}', (attendu: number) => {
  assert.strictEqual(
    hausse(
      ({ beneficiaires }) => beneficiaires.series,
      'byBeneficiairesSuivis',
    ),
    attendu,
  )
})

Then('les bénéficiaires anonymes ont augmenté de {int}', (attendu: number) => {
  assert.strictEqual(
    hausse(
      ({ beneficiaires }) => beneficiaires.series,
      'byBeneficiairesAnonymes',
    ),
    attendu,
  )
})

Then(
  'les accompagnements par des médiateurs ont augmenté de {int}',
  (attendu: number) => {
    assert.strictEqual(
      hausse(({ accompagnements }) => accompagnements.series, 'byMediateurs'),
      attendu,
    )
  },
)

Then(
  'chaque mois du cumul des accompagnements ajoute ceux du mois au cumul précédent',
  () => {
    const { perMonth, runningTotalPerMonth } = releve('apres').accompagnements
    assert.deepStrictEqual(
      runningTotalPerMonth,
      cumulAttendu(runningTotalPerMonth[0], perMonth, (cumul, mois) => ({
        mois: mois.mois,
        byMediateurs: cumul.byMediateurs + mois.byMediateurs,
        byConseillers: cumul.byConseillers + mois.byConseillers,
      })),
    )
  },
)

Then(
  'chaque mois du cumul des bénéficiaires ajoute ceux du mois au cumul précédent',
  () => {
    const { perMonth, runningTotalPerMonth } = releve('apres').beneficiaires
    assert.deepStrictEqual(
      runningTotalPerMonth,
      cumulAttendu(runningTotalPerMonth[0], perMonth, (cumul, mois) => ({
        mois: mois.mois,
        byBeneficiairesSuivis:
          cumul.byBeneficiairesSuivis + mois.byBeneficiairesSuivis,
        byBeneficiairesAnonymes:
          cumul.byBeneficiairesAnonymes + mois.byBeneficiairesAnonymes,
      })),
    )
  },
)
