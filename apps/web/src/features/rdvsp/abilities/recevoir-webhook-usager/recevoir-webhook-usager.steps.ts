import assert from 'node:assert'
import type { RecevoirWebhookUsager } from '@app/web/features/rdvsp/abilities/recevoir-webhook-usager/domain/recevoir-webhook-usager'
import { lireNotificationUsager } from '@app/web/features/rdvsp/abilities/recevoir-webhook-usager/implementation/api/lire-notification-usager'
import {
  anonymiserEtSupprimerUsager,
  beneficiairesLiesAUsager,
  mettreAJourUsager,
} from '@app/web/features/rdvsp/abilities/recevoir-webhook-usager/implementation/prisma/webhook-usager.prisma'
import { recevoirWebhookUsager } from '@app/web/features/rdvsp/abilities/recevoir-webhook-usager/implementation/recevoir-webhook-usager'
import { EvenementWebhook } from '@app/web/features/rdvsp/domain/evenement-webhook'
import {
  beneficiaireEnBase,
  ID_TEST,
  seedBeneficiaire,
  seedUsagerRdv,
  testMediateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

const USAGER_ID = ID_TEST.usager + 500

let beneficiaireId: string | undefined
let compteurAvant = 0
let resultat: Awaited<ReturnType<RecevoirWebhookUsager>> | undefined

const recevoir = recevoirWebhookUsager({
  lireNotification: lireNotificationUsager,
  beneficiairesLies: beneficiairesLiesAUsager,
  mettreAJour: mettreAJourUsager,
  anonymiserEtSupprimer: anonymiserEtSupprimerUsager,
})

const notificationUsager = (nom: string) => ({
  id: USAGER_ID,
  first_name: 'Jean',
  last_name: nom,
  email: null,
  phone_number: null,
  phone_number_formatted: null,
  birth_date: null,
  address: null,
  address_details: null,
  affiliation_number: null,
  caisse_affiliation: null,
  birth_name: null,
  created_at: null,
  invitation_created_at: null,
  invitation_accepted_at: null,
  responsible_id: null,
  notify_by_email: false,
  notify_by_sms: false,
})

const compteurDuMediateur = async (): Promise<number> =>
  (
    await prismaClient.mediateur.findUniqueOrThrow({
      where: { id: testMediateurId },
      select: { beneficiairesCount: true },
    })
  ).beneficiairesCount

const usagerEnBase = async () =>
  await prismaClient.rdvUser.findUnique({
    where: { id: USAGER_ID },
    select: { id: true, lastName: true },
  })

Given('un usager notifié rattaché à un bénéficiaire', async () => {
  await seedUsagerRdv(USAGER_ID)
  await prismaClient.rdvUser.update({
    where: { id: USAGER_ID },
    data: { lastName: 'Dupont' },
  })
  beneficiaireId = await seedBeneficiaire({
    prenom: 'Jean',
    nom: 'Dupont',
    rdvUserId: USAGER_ID,
  })
  compteurAvant = await compteurDuMediateur()
})

Given('un usager notifié rattaché à aucun bénéficiaire', async () => {
  beneficiaireId = undefined
  await seedUsagerRdv(USAGER_ID)
  await prismaClient.rdvUser.update({
    where: { id: USAGER_ID },
    data: { lastName: 'Dupont' },
  })
})

When(
  'RDV Service Public notifie la mise à jour de l’usager sous le nom {string}',
  async (nom: string) => {
    resultat = await recevoir({
      evenement: EvenementWebhook('updated'),
      payload: notificationUsager(nom),
    })
  },
)

When('RDV Service Public notifie la création de l’usager', async () => {
  resultat = await recevoir({
    evenement: EvenementWebhook('created'),
    payload: notificationUsager('Durand'),
  })
})

When('RDV Service Public notifie la suppression de l’usager', async () => {
  resultat = await recevoir({
    evenement: EvenementWebhook('destroyed'),
    payload: notificationUsager('Dupont'),
  })
})

Then('la notification usager est traitée', () => {
  assert.strictEqual(resultat?._tag, 'traite')
})

Then(
  'la notification usager est ignorée pour la raison {string}',
  (raison: string) => {
    assert.strictEqual(resultat?._tag, 'ignore')
    assert.strictEqual(
      resultat._tag === 'ignore' ? resultat.raison : undefined,
      raison,
    )
  },
)

Then('l’usager notifié se nomme {string}', async (nom: string) => {
  assert.strictEqual((await usagerEnBase())?.lastName, nom)
})

Then('l’usager notifié n’existe plus', async () => {
  assert.strictEqual(await usagerEnBase(), null)
})

Then('le bénéficiaire rattaché est anonymisé et supprimé', async () => {
  assert.ok(beneficiaireId)
  const beneficiaire = await beneficiaireEnBase(beneficiaireId)

  assert.strictEqual(beneficiaire?.prenom, null)
  assert.strictEqual(beneficiaire?.nom, null)
  assert.strictEqual(beneficiaire?.rdvUserId, null)
})

Then(
  'le compteur de bénéficiaires du médiateur a diminué de {int}',
  async (perte: number) => {
    assert.strictEqual(await compteurDuMediateur(), compteurAvant - perte)
  },
)
