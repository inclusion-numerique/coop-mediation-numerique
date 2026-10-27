import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import {
  OutilDAccompagnement,
  outilsDAccompagnementVisibles,
  type ProfilOutils,
  type ValeurDOutilDAccompagnement,
} from './domain'

const consultation: {
  profil?: ProfilOutils
  outils: readonly OutilDAccompagnement[]
} = { outils: [] }

const voit = (...outils: ValeurDOutilDAccompagnement[]) => {
  assert.ok(
    outils.every((outil) =>
      consultation.outils.includes(OutilDAccompagnement(outil)),
    ),
  )
}

const neVoitPas = (outil: ValeurDOutilDAccompagnement) => {
  assert.ok(!consultation.outils.includes(OutilDAccompagnement(outil)))
}

Given('un médiateur hors dispositif', () => {
  consultation.profil = { coordinateur: false, conseillerNumerique: false }
})

Given('un médiateur du dispositif Conseiller numérique', () => {
  consultation.profil = { coordinateur: false, conseillerNumerique: true }
})

Given('un coordinateur du dispositif Conseiller numérique', () => {
  consultation.profil = { coordinateur: true, conseillerNumerique: true }
})

When('il consulte ses outils', () => {
  assert.ok(consultation.profil, 'Aucun profil')
  consultation.outils = outilsDAccompagnementVisibles(consultation.profil)
})

Then(
  'il voit Aidants Connect, la cartographie nationale, Les Bases et Mattermost',
  () => {
    voit('AidantsConnect', 'CartographieNationale', 'LesBases', 'Mattermost')
  },
)

Then("il ne voit pas le centre d'aide du dispositif", () => {
  neVoitPas('CentreDAideConseillerNumerique')
})

Then(
  "il voit la base des contributions et le centre d'aide du dispositif",
  () => {
    voit(
      'BaseConseillerNumeriqueContributions',
      'CentreDAideConseillerNumerique',
    )
  },
)

Then('il ne voit pas la base des coordinateurs', () => {
  neVoitPas('BaseConseillersNumeriquesCoordinateurs')
})

Then('il voit Mon Inclusion Numérique et la base des coordinateurs', () => {
  voit('MonInclusionNumerique', 'BaseConseillersNumeriquesCoordinateurs')
})
