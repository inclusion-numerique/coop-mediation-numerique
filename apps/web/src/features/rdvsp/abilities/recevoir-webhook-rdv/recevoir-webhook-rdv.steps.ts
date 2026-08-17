import assert from 'node:assert'
import { EvenementWebhook } from '@app/web/features/rdvsp/abilities/recevoir-webhook-rdv/domain/evenement-webhook'
import type { RecevoirWebhookRdv } from '@app/web/features/rdvsp/abilities/recevoir-webhook-rdv/domain/recevoir-webhook-rdv'
import { lireNotificationRdv } from '@app/web/features/rdvsp/abilities/recevoir-webhook-rdv/implementation/api/lire-notification-rdv'
import {
  comptePourWebhook,
  enregistrerRdvDeLaNotification,
  rdvConnuParId,
  supprimerRdvDeLaNotification,
} from '@app/web/features/rdvsp/abilities/recevoir-webhook-rdv/implementation/prisma/webhook-rdv.prisma'
import { recevoirWebhookRdv } from '@app/web/features/rdvsp/abilities/recevoir-webhook-rdv/implementation/recevoir-webhook-rdv'
import {
  ID_TEST,
  rdvEnBase,
  seedCompteRdv,
  seedMotif,
  seedOrganisation,
  seedRdv,
  suivreUsagerRdv,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const AGENT_ID = ID_TEST.compte + 11
const RDV_ID = ID_TEST.rdv + 400
const ORGANISATION_ID = ID_TEST.organisation + 400
const USAGER_ID = ID_TEST.usager + 400
const PARTICIPATION_ID = ID_TEST.participation + 400
const MOTIF_ID = ID_TEST.organisation + 401

let resultat: Awaited<ReturnType<RecevoirWebhookRdv>> | undefined

const recevoir = recevoirWebhookRdv({
  lireNotification: lireNotificationRdv,
  comptePourWebhook,
  rdvConnuParId,
  enregistrer: enregistrerRdvDeLaNotification,
  supprimer: supprimerRdvDeLaNotification,
  // Le rapprochement des bénéficiaires a ses propres scénarios.
  rapprocherBeneficiaires: async () => {
    // Volontairement inerte.
  },
})

/** Payload tel que RDV Service Public l'émet, catégorie de motif en chaîne comprise. */
const notification = ({
  debut = '2026-09-01T09:00:00.000Z',
  statut = 'unknown',
}: {
  debut?: string
  statut?: string
} = {}) => ({
  id: RDV_ID,
  uuid: `00000000-0000-4000-8000-${String(RDV_ID).padStart(12, '0')}`,
  address: '12 rue de la Paix, 75002 Paris',
  starts_at: debut,
  ends_at: new Date(new Date(debut).getTime() + 3_600_000).toISOString(),
  duration_in_min: 60,
  status: statut,
  url_for_agents: `https://rdv.anct.gouv.fr/admin/rdvs/${RDV_ID}`,
  users_count: 1,
  context: null,
  created_by_id: null,
  cancelled_at: null,
  collectif: false,
  name: null,
  max_participants_count: null,
  agents: [{ id: AGENT_ID }],
  organisation: {
    id: ORGANISATION_ID,
    name: 'Médiathèque',
    email: null,
    phone_number: null,
    verticale: null,
  },
  motif: {
    id: MOTIF_ID,
    name: 'Accompagnement numérique',
    collectif: false,
    organisation_id: ORGANISATION_ID,
    follow_up: false,
    instruction_for_rdv: null,
    location_type: null,
    motif_category: 'une chaine, pas un objet',
  },
  lieu: null,
  participations: [
    {
      id: PARTICIPATION_ID,
      status: statut,
      send_reminder_notification: false,
      send_lifecycle_notifications: false,
      user: {
        id: USAGER_ID,
        first_name: 'Jean',
        last_name: 'Dupont',
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
      },
    },
  ],
})

Given('un compte notifié', async () => {
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  await seedOrganisation({ id: ORGANISATION_ID })
  suivreUsagerRdv(USAGER_ID)
})

Given(
  'un compte notifié synchronisé depuis le {string}',
  async (jour: string) => {
    await seedCompteRdv({
      id: AGENT_ID,
      accessToken: 'jeton-acces',
      syncFrom: new Date(`${jour}T00:00:00.000Z`),
    })
    await seedOrganisation({ id: ORGANISATION_ID })
    suivreUsagerRdv(USAGER_ID)
  },
)

Given('aucun compte notifié', () => {
  // Le hook Before a déjà retiré tout compte de l'utilisateur de test.
})

Given('le rendez-vous notifié est déjà enregistré', async () => {
  await seedRdv({
    id: RDV_ID,
    rdvAccountId: AGENT_ID,
    organisationId: ORGANISATION_ID,
    debut: new Date('2026-09-01T09:00:00.000Z'),
  })
})

Given(
  'le rendez-vous notifié est déjà enregistré avec un CRA écarté',
  async () => {
    // Le motif doit exister et être rattaché : sans lui, le rendez-vous en base
    // diffère de la notification et rien n'est jamais « sans changement ».
    await seedMotif({ id: MOTIF_ID, organisationId: ORGANISATION_ID })
    await seedRdv({
      id: RDV_ID,
      rdvAccountId: AGENT_ID,
      organisationId: ORGANISATION_ID,
      motifId: MOTIF_ID,
      debut: new Date('2026-09-01T09:00:00.000Z'),
      craDeclined: true,
    })
  },
)

When('RDV Service Public notifie la création d’un rendez-vous', async () => {
  resultat = await recevoir({
    evenement: EvenementWebhook('created'),
    payload: notification(),
  })
})

When('RDV Service Public notifie un rendez-vous illisible', async () => {
  resultat = await recevoir({
    evenement: EvenementWebhook('updated'),
    payload: { id: 'pas un identifiant' },
  })
})

When(
  'RDV Service Public notifie un rendez-vous du {string}',
  async (jour: string) => {
    resultat = await recevoir({
      evenement: EvenementWebhook('updated'),
      payload: notification({ debut: `${jour}T09:00:00.000Z` }),
    })
  },
)

When('RDV Service Public notifie ce rendez-vous sans changement', async () => {
  resultat = await recevoir({
    evenement: EvenementWebhook('updated'),
    payload: notification(),
  })
})

When(
  'RDV Service Public notifie ce rendez-vous au statut {string}',
  async (statut: string) => {
    resultat = await recevoir({
      evenement: EvenementWebhook('updated'),
      payload: notification({ statut }),
    })
  },
)

When('RDV Service Public notifie la suppression du rendez-vous', async () => {
  resultat = await recevoir({
    evenement: EvenementWebhook('destroyed'),
    payload: notification(),
  })
})

Then('la notification est traitée', () => {
  assert.strictEqual(resultat?._tag, 'traite')
})

Then(
  'la notification est ignorée pour la raison {string}',
  (raison: string) => {
    assert.strictEqual(resultat?._tag, 'ignore')
    assert.strictEqual(
      resultat._tag === 'ignore' ? resultat.raison : undefined,
      raison,
    )
  },
)

Then('le rendez-vous notifié est enregistré', async () => {
  assert.ok(await rdvEnBase(RDV_ID), 'Le rendez-vous devrait être en base')
})

Then('le rendez-vous notifié n’est pas enregistré', async () => {
  assert.strictEqual(await rdvEnBase(RDV_ID), null)
})

Then('le rendez-vous notifié garde son CRA écarté', async () => {
  assert.strictEqual((await rdvEnBase(RDV_ID))?.craDeclined, true)
})

Then(
  'le rendez-vous notifié porte le statut {string}',
  async (statut: string) => {
    assert.strictEqual((await rdvEnBase(RDV_ID))?.status, statut)
  },
)
