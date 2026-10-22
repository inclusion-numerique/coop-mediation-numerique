import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import type { UtilisateursActifs } from './domain'
import { mesurerLesUtilisateursActifs } from './implementation'

const mesure: {
  avant?: UtilisateursActifs
  apres?: UtilisateursActifs
} = {}

const semer = (
  compte: Omit<
    Parameters<typeof semerUnCompteDeListe>[0],
    'prenom' | 'marqueur' | 'creeLe' | 'inscritLe'
  >,
) =>
  semerUnCompteDeListe({
    prenom: 'Mesure',
    marqueur: `Actifs${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
    ...compte,
  })

Given('les utilisateurs actifs déjà mesurés', async () => {
  mesure.avant = await mesurerLesUtilisateursActifs(new Date())
})

Given(
  'un médiateur hors dispositif qui vient de créer un bénéficiaire',
  async () => {
    await semer({
      mediateur: { derniereActivite: null, dernierBeneficiaire: new Date() },
    })
  },
)

Given(
  'un coordinateur sans équipe ni coordination qui vient de se connecter',
  async () => {
    await semer({
      derniereVisite: new Date(),
      coordinateur: { aUneEquipe: false, aCoordonne: false },
    })
  },
)

Given(
  'un médiateur coordinateur sans équipe qui vient de saisir une activité',
  async () => {
    await semer({
      mediateur: { derniereActivite: new Date(), dernierBeneficiaire: null },
      coordinateur: { aUneEquipe: false, aCoordonne: false },
    })
  },
)

When('les utilisateurs actifs sont mesurés de nouveau', async () => {
  mesure.apres = await mesurerLesUtilisateursActifs(new Date())
})

Then(
  /^les (mediateurs|médiateurs|coordinateurs) comptent (\d+) actifs? et (\d+) profils? de plus$/,
  (categorie: string, actifs: string, profils: string) => {
    const cle = categorie === 'coordinateurs' ? 'coordinateurs' : 'mediateurs'
    assert.ok(mesure.avant && mesure.apres)
    assert.strictEqual(
      mesure.apres[cle].value - mesure.avant[cle].value,
      Number(actifs),
    )
    assert.strictEqual(
      mesure.apres[cle].total - mesure.avant[cle].total,
      Number(profils),
    )
  },
)
