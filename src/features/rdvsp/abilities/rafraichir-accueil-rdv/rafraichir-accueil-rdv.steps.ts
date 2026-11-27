import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { consulterRdvsAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/consulter-rdvs-accueil'
import { compteDuMediateur } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementations/prisma/compte-du-mediateur.query'
import { lireDonneesAccueilRdv } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementations/prisma/donnees-accueil-rdv.query'
import { rafraichirAccueilRdv } from '@/features/rdvsp/abilities/rafraichir-accueil-rdv/domain/rafraichir-accueil-rdv'
import {
  ID_TEST,
  seedCompteRdv,
  testUtilisateurId,
} from '@/features/rdvsp/rdvsp.cucumber'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDuRattrapage } from './domain/errors'

const AGENT_ID = ID_TEST.compte + 12
const MAINTENANT = new Date('2026-09-01T10:00:00.000Z')

type Rattrapage = Result<{ readonly derive: number }, EchecDuRattrapage>

const etat: {
  rattrapage: Rattrapage
  resultat: Awaited<ReturnType<ReturnType<typeof rafraichirAvec>>> | undefined
} = { rattrapage: success({ derive: 0 }), resultat: undefined }

const rafraichirAvec = (rattrapage: Rattrapage) =>
  rafraichirAccueilRdv({
    declencher: async () => rattrapage,
    consulter: consulterRdvsAccueil({
      compteDuMediateur,
      lireDonnees: lireDonneesAccueilRdv,
    }),
  })

Given('un compte RDV consultable à rafraîchir', async () => {
  etat.resultat = undefined
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given('un rattrapage qui ne change rien', () => {
  etat.rattrapage = success({ derive: 0 })
})

Given('un rattrapage qui change {int} éléments', (derive: number) => {
  etat.rattrapage = success({ derive })
})

Given('un rattrapage refusé', () => {
  etat.rattrapage = failure({ _tag: 'NonAutorise' })
})

When('je rafraîchis l’accueil', async () => {
  etat.resultat = await rafraichirAvec(etat.rattrapage)({
    demandeur: { id: testUtilisateurId, role: 'User' },
    maintenant: MAINTENANT,
  })
})

Then('l’accueil reste inchangé', () => {
  assert.deepStrictEqual(etat.resultat, success({ _tag: 'inchange' }))
})

Then('l’accueil est relu avec une dérive de {int}', (derive: number) => {
  const { resultat } = etat
  assert.ok(resultat?.success, 'Le rafraîchissement a échoué')
  assert.ok(resultat.data._tag === 'rafraichi', 'L’accueil n’a pas été relu')
  assert.strictEqual(resultat.data.derive, derive)
})

Then('le rafraîchissement échoue sur {string}', (tag: string) => {
  assert.deepStrictEqual(etat.resultat, failure({ _tag: tag }))
})
