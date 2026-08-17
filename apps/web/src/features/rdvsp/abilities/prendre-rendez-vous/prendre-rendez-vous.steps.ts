import assert from 'node:assert'
import {
  BeneficiaireCibleId,
  MediateurProprietaireId,
} from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/domain/beneficiaire-cible'
import type { PrendreRendezVous } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/domain/prendre-rendez-vous'
import { prendreRendezVous } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/implementation/prendre-rendez-vous'
import { beneficiaireADemander } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/implementation/prisma/beneficiaire-a-demander.query'
import { compteDuMediateur } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/implementation/prisma/compte-du-mediateur.query'
import { lierUsagerAuBeneficiaire } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/implementation/prisma/lier-usager-au-beneficiaire.mutation'
import {
  DemandeRdvId,
  UrlPriseRdv,
  type UsagerDeLaDemande,
} from '@app/web/features/rdvsp/domain/demande-rdv'
import { ApiIndisponible } from '@app/web/features/rdvsp/domain/errors'
import type { RdvServicePublicApi } from '@app/web/features/rdvsp/domain/rdv-service-public.port'
import { UsagerId } from '@app/web/features/rdvsp/domain/usager-id'
import {
  beneficiaireEnBase,
  seedAutreMediateur,
  seedBeneficiaire,
  seedCompteRdv,
  seedUsagerRdv,
  suivreUsagerRdv,
  supprimerCompteRdvDuMediateur,
  testMediateurId,
  testUtilisateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@app/web/libraries/result'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const AGENT_ID = 987_658
const USAGER_RENDU = 9002

let beneficiaireId: string | undefined
let usagerRecu: UsagerDeLaDemande | undefined
let apiRefuse = false
let resultat: Awaited<ReturnType<PrendreRendezVous>> | undefined

/** Retient l'usager transmis : c'est lui que les scénarios interrogent. */
const creerDemandeRdvDouble: RdvServicePublicApi['creerDemandeRdv'] = async (
  _compte,
  demande,
) => {
  usagerRecu = demande.usager

  if (apiRefuse) {
    return failure(ApiIndisponible(503, 'service indisponible'))
  }

  const usagerId =
    demande.usager._tag === 'existant'
      ? demande.usager.id
      : UsagerId(USAGER_RENDU)

  suivreUsagerRdv(usagerId)

  return success({
    id: DemandeRdvId(1),
    usagerId,
    url: UrlPriseRdv('https://rdv.anct.gouv.fr/prendre-rdv/1'),
    rdvId: null,
  })
}

const planifier = prendreRendezVous({
  beneficiaireADemander,
  compteDuMediateur,
  creerDemandeRdv: creerDemandeRdvDouble,
  lierUsager: lierUsagerAuBeneficiaire,
  urlDossierBeneficiaire: (id) =>
    `https://coop.test/coop/mes-beneficiaires/${id}/accompagnements`,
})

const reinitialiser = () => {
  usagerRecu = undefined
  apiRefuse = false
  beneficiaireId = undefined
}

Given('un bénéficiaire suivi sans usager RDV', async () => {
  reinitialiser()
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  beneficiaireId = await seedBeneficiaire({
    prenom: 'Jean',
    nom: 'Dupont',
    email: 'jean.dupont@example.com',
  })
})

Given(
  'un bénéficiaire suivi déjà rattaché à l’usager RDV {int}',
  async (usagerId: number) => {
    reinitialiser()
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    await seedUsagerRdv(usagerId)
    beneficiaireId = await seedBeneficiaire({
      prenom: 'Jean',
      nom: 'Dupont',
      rdvUserId: usagerId,
    })
  },
)

Given('un bénéficiaire suivi sans identité', async () => {
  reinitialiser()
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  beneficiaireId = await seedBeneficiaire({ anonyme: true })
})

Given('un bénéficiaire suivi par un autre médiateur', async () => {
  reinitialiser()
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  beneficiaireId = await seedBeneficiaire({
    prenom: 'Jean',
    nom: 'Dupont',
    mediateurId: await seedAutreMediateur(),
  })
})

Given('aucun bénéficiaire à planifier', async () => {
  reinitialiser()
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given('aucun compte RDV pour planifier', async () => {
  await supprimerCompteRdvDuMediateur()
})

Given('RDV Service Public refusera la demande', () => {
  apiRefuse = true
})

When('je planifie un rendez-vous avec ce bénéficiaire', async () => {
  assert.ok(beneficiaireId, 'Aucun bénéficiaire à planifier')
  resultat = await planifier({
    utilisateurId: testUtilisateurId,
    mediateurId: MediateurProprietaireId(testMediateurId),
    beneficiaireId: BeneficiaireCibleId(beneficiaireId),
  })
})

When('je planifie un rendez-vous avec un bénéficiaire inexistant', async () => {
  resultat = await planifier({
    utilisateurId: testUtilisateurId,
    mediateurId: MediateurProprietaireId(testMediateurId),
    beneficiaireId: BeneficiaireCibleId(v4()),
  })
})

Then('RDV Service Public reçoit une identité à créer', () => {
  assert.strictEqual(usagerRecu?._tag, 'aCreer')
})

Then(
  'RDV Service Public reçoit l’usager existant {int}',
  (usagerId: number) => {
    assert.deepStrictEqual(usagerRecu, { _tag: 'existant', id: usagerId })
  },
)

Then('le bénéficiaire est rattaché à l’usager rendu', async () => {
  assert.ok(beneficiaireId)
  assert.strictEqual(
    (await beneficiaireEnBase(beneficiaireId))?.rdvUserId,
    USAGER_RENDU,
  )
})

Then(
  'le bénéficiaire reste rattaché à l’usager {int}',
  async (usagerId: number) => {
    assert.ok(beneficiaireId)
    assert.strictEqual(
      (await beneficiaireEnBase(beneficiaireId))?.rdvUserId,
      usagerId,
    )
  },
)

Then('la demande aboutit', () => {
  assert.ok(resultat?.success, 'La demande a échoué')
})

Then('la demande échoue avec l’erreur {string}', (tag: string) => {
  assert.ok(resultat && !resultat.success, 'La demande aurait dû échouer')
  assert.strictEqual(resultat.error._tag, tag)
})

Then('RDV Service Public n’a reçu aucune demande', () => {
  assert.strictEqual(usagerRecu, undefined)
})

Then('le bénéficiaire n’est rattaché à aucun usager', async () => {
  assert.ok(beneficiaireId)
  assert.strictEqual(
    (await beneficiaireEnBase(beneficiaireId))?.rdvUserId,
    null,
  )
})
