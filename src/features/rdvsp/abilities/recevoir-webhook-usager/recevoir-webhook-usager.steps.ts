import assert from 'node:assert'
import { Given, Then, When, type World } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { recevoirWebhookUsager } from '@/features/rdvsp/abilities/recevoir-webhook-usager/domain/recevoir-webhook-usager'
import { lireNotificationUsager } from '@/features/rdvsp/abilities/recevoir-webhook-usager/implementations/api/notification-usager.params'
import { beneficiairesLiesAUsager } from '@/features/rdvsp/abilities/recevoir-webhook-usager/implementations/prisma/beneficiaires-lies.query'
import {
  anonymiserEtSupprimerUsager,
  mettreAJourUsager,
} from '@/features/rdvsp/abilities/recevoir-webhook-usager/implementations/prisma/webhook-usager.mutation'
import { EvenementWebhook } from '@/features/rdvsp/domain/webhook/evenement-webhook'
import {
  beneficiaireEnBase,
  ID_TEST,
  seedBeneficiaire,
  seedUsagerRdv,
  testMediateurId,
} from '@/features/rdvsp/rdvsp.cucumber'

const USAGER_ID = ID_TEST.usager + 500

type Monde = World & {
  beneficiaireId?: string
  compteurAvant?: number
  resultat?: Awaited<ReturnType<typeof recevoir>>
}

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

Given(
  'un usager notifié rattaché à un bénéficiaire',
  async function (this: Monde) {
    await seedUsagerRdv(USAGER_ID)
    await prismaClient.rdvUser.update({
      where: { id: USAGER_ID },
      data: { lastName: 'Dupont' },
    })
    this.beneficiaireId = await seedBeneficiaire({
      prenom: 'Jean',
      nom: 'Dupont',
      rdvUserId: USAGER_ID,
    })
    this.compteurAvant = await compteurDuMediateur()
  },
)

Given(
  'un usager notifié rattaché à un bénéficiaire de Nice',
  async function (this: Monde) {
    await seedUsagerRdv(USAGER_ID)
    await prismaClient.rdvUser.update({
      where: { id: USAGER_ID },
      data: { lastName: 'Dupont' },
    })
    this.beneficiaireId = await seedBeneficiaire({
      prenom: 'Jean',
      nom: 'Dupont',
      rdvUserId: USAGER_ID,
      commune: 'Nice',
      communeCodePostal: '06100,06000,06200,06300',
      communeCodeInsee: '06088',
    })
    this.compteurAvant = await compteurDuMediateur()
  },
)

Given(
  'un usager notifié rattaché à aucun bénéficiaire',
  async function (this: Monde) {
    await seedUsagerRdv(USAGER_ID)
    await prismaClient.rdvUser.update({
      where: { id: USAGER_ID },
      data: { lastName: 'Dupont' },
    })
  },
)

When(
  'RDV Service Public notifie la mise à jour de l’usager sous le nom {string}',
  async function (this: Monde, nom: string) {
    this.resultat = await recevoir({
      evenement: EvenementWebhook('updated'),
      payload: notificationUsager(nom),
    })
  },
)

When(
  'RDV Service Public notifie la création de l’usager',
  async function (this: Monde) {
    this.resultat = await recevoir({
      evenement: EvenementWebhook('created'),
      payload: notificationUsager('Durand'),
    })
  },
)

When(
  'RDV Service Public notifie la suppression de l’usager',
  async function (this: Monde) {
    this.resultat = await recevoir({
      evenement: EvenementWebhook('destroyed'),
      payload: notificationUsager('Dupont'),
    })
  },
)

Then('la notification usager est traitée', function (this: Monde) {
  assert.ok(this.resultat?.success, 'La notification n’a pas été lue')
  assert.notStrictEqual(this.resultat.data._tag, 'ignore')
})

Then(
  'la notification usager est ignorée pour la raison {string}',
  function (this: Monde, raison: string) {
    assert.ok(this.resultat?.success, 'La notification n’a pas été lue')
    assert.strictEqual(this.resultat.data._tag, 'ignore')
    assert.strictEqual(
      this.resultat.data._tag === 'ignore'
        ? this.resultat.data.raison
        : undefined,
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

Then(
  'le bénéficiaire rattaché est anonymisé et supprimé',
  async function (this: Monde) {
    assert.ok(this.beneficiaireId)
    const beneficiaire = await beneficiaireEnBase(this.beneficiaireId)

    assert.strictEqual(beneficiaire?.prenom, null)
    assert.strictEqual(beneficiaire?.nom, null)
    assert.strictEqual(beneficiaire?.rdvUserId, null)
  },
)

Then(
  'le compteur de bénéficiaires du médiateur a diminué de {int}',
  async function (this: Monde, perte: number) {
    assert.strictEqual(
      await compteurDuMediateur(),
      (this.compteurAvant ?? 0) - perte,
    )
  },
)

Then(
  'le bénéficiaire rattaché ne garde que le code postal {string}',
  async function (this: Monde, codePostal: string) {
    assert.ok(this.beneficiaireId)
    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: this.beneficiaireId },
      select: {
        commune: true,
        communeCodePostal: true,
        communeCodeInsee: true,
      },
    })
    assert.deepStrictEqual(beneficiaire, {
      commune: 'Nice',
      communeCodePostal: codePostal,
      communeCodeInsee: '06088',
    })
  },
)
