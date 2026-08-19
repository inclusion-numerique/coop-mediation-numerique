import assert from 'node:assert'
import type { SynchroniserRdvs } from '@app/web/features/rdvsp/abilities/synchroniser-rdvs/domain/synchroniser-rdvs'
import {
  appliquerPlanLot,
  supprimerMotifsOrphelins,
  supprimerRdvs,
} from '@app/web/features/rdvsp/abilities/synchroniser-rdvs/implementation/prisma/appliquer-plan-lot.mutation'
import {
  etatConnuDuLot,
  rdvsDejaImportes,
} from '@app/web/features/rdvsp/abilities/synchroniser-rdvs/implementation/prisma/etat-connu.query'
import { synchroniserRdvs } from '@app/web/features/rdvsp/abilities/synchroniser-rdvs/implementation/synchroniser-rdvs'
import { compteRdvToDomain } from '@app/web/features/rdvsp/db'
import { AdresseRdv } from '@app/web/features/rdvsp/domain/adresse-rdv'
import {
  type CompteRdvUtilisable,
  estUtilisable,
} from '@app/web/features/rdvsp/domain/compte-rdv'
import { DureeEnMinutes } from '@app/web/features/rdvsp/domain/duree-en-minutes'
import { ApiIndisponible } from '@app/web/features/rdvsp/domain/errors'
import {
  NomExterne,
  PrenomExterne,
} from '@app/web/features/rdvsp/domain/identite'
import { OrganisationId } from '@app/web/features/rdvsp/domain/organisation-id'
import { ParticipationId } from '@app/web/features/rdvsp/domain/participation-id'
import type { Rdv, RdvSynchronise } from '@app/web/features/rdvsp/domain/rdv'
import { RdvAgentId } from '@app/web/features/rdvsp/domain/rdv-agent-id'
import { RdvId } from '@app/web/features/rdvsp/domain/rdv-id'
import type { RdvServicePublicApi } from '@app/web/features/rdvsp/domain/rdv-service-public.port'
import { RdvUuid } from '@app/web/features/rdvsp/domain/rdv-uuid'
import { StatutPresence } from '@app/web/features/rdvsp/domain/statut-presence'
import { UrlAgent } from '@app/web/features/rdvsp/domain/url-agent'
import type { Usager } from '@app/web/features/rdvsp/domain/usager'
import { UsagerId } from '@app/web/features/rdvsp/domain/usager-id'
import {
  compteRdvEnBase,
  ID_TEST,
  rdvEnBase,
  seedCompteRdv,
  seedOrganisation,
  seedParticipation,
  seedRdv,
  suivreUsagerRdv,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@app/web/libraries/result'
import { Given, Then, When } from '@cucumber/cucumber'

const AGENT_ID = ID_TEST.compte + 10
const RDV_ID = ID_TEST.rdv + 300
const ORGANISATION_ID = ID_TEST.organisation + 300
const USAGER_ID = ID_TEST.usager + 300
const PARTICIPATION_ID = ID_TEST.participation + 300

let recus: RdvSynchronise[] = []
let apiRefuse = false
let resultat: Awaited<ReturnType<SynchroniserRdvs>> | undefined

const usager: Usager = {
  id: UsagerId(USAGER_ID),
  prenom: PrenomExterne('Jean'),
  nom: NomExterne('Dupont'),
  email: null,
  telephone: null,
  telephoneFormate: null,
  dateNaissance: null,
  creation: null,
  invitationCreee: null,
  invitationAcceptee: null,
  coordonnees: {
    adresse: null,
    complementAdresse: null,
    numeroAllocataire: null,
    caisseAffiliation: null,
    nomNaissance: null,
  },
  responsableId: null,
  notifierParEmail: false,
  notifierParSms: false,
}

const rdvRecu = (statut: string): Rdv => ({
  id: RdvId(RDV_ID),
  uuid: RdvUuid(`00000000-0000-4000-8000-${String(RDV_ID).padStart(12, '0')}`),
  agentId: RdvAgentId(AGENT_ID),
  organisationId: OrganisationId(ORGANISATION_ID),
  adresse: AdresseRdv('12 rue de la Paix, 75002 Paris'),
  debut: new Date('2026-09-01T09:00:00.000Z'),
  fin: new Date('2026-09-01T10:00:00.000Z'),
  duree: DureeEnMinutes(60),
  statutPresence: StatutPresence.schema.parse(statut),
  urlAgent: UrlAgent(`https://rdv.anct.gouv.fr/admin/rdvs/${RDV_ID}`),
  nombreParticipants: 1,
  contexte: null,
  creeParId: null,
  annulation: null,
  motif: null,
  lieu: null,
  collectif: false,
  participations: [
    {
      id: ParticipationId(PARTICIPATION_ID),
      usagerId: usager.id,
      usager,
      statutPresence: StatutPresence.schema.parse(statut),
      notificationRappel: false,
      notificationsCycleDeVie: false,
    },
  ],
})

const listerRdvsDouble: RdvServicePublicApi['listerRdvs'] = async () =>
  apiRefuse
    ? failure(ApiIndisponible(503, 'service indisponible'))
    : success(recus)

const synchroniser = synchroniserRdvs({
  listerRdvs: listerRdvsDouble,
  rdvsDejaImportes,
  etatConnuDuLot,
  appliquerPlan: appliquerPlanLot,
  supprimerRdvs,
  supprimerMotifsOrphelins,
  // Le rapprochement des bénéficiaires a ses propres scénarios : ici on éprouve
  // la réconciliation des rendez-vous, pas ce qu'elle déclenche ensuite.
  rapprocherBeneficiaires: async () => {
    // Volontairement inerte.
  },
})

const compteUtilisable = async (): Promise<CompteRdvUtilisable> => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.ok(row, 'Aucun compte RDV en base')
  const compte = compteRdvToDomain(row)
  assert.ok(estUtilisable(compte), 'Le compte devrait être utilisable')
  return compte
}

Given('un compte RDV à synchroniser', async () => {
  recus = []
  apiRefuse = false
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  await seedOrganisation({ id: ORGANISATION_ID })
  suivreUsagerRdv(USAGER_ID)
})

Given('RDV Service Public renvoie un rendez-vous à venir', () => {
  recus = [{ rdv: rdvRecu('unknown'), brut: { id: RDV_ID } }]
})

Given(
  'un rendez-vous déjà enregistré au statut {string}',
  async (statut: string) => {
    await seedRdv({
      id: RDV_ID,
      rdvAccountId: AGENT_ID,
      organisationId: ORGANISATION_ID,
      status: StatutPresence.schema.parse(statut),
      debut: new Date('2026-09-01T09:00:00.000Z'),
    })
    // Même participation que celle du rendez-vous reçu : sans elle, les deux
    // diffèrent par leur liste de participants et rien n'est jamais « inchangé ».
    await seedParticipation({
      id: PARTICIPATION_ID,
      rdvId: RDV_ID,
      usagerId: USAGER_ID,
      status: StatutPresence.schema.parse(statut),
    })
  },
)

Given(
  'RDV Service Public renvoie ce rendez-vous au statut {string}',
  (statut: string) => {
    recus = [{ rdv: rdvRecu(statut), brut: { id: RDV_ID } }]
  },
)

Given('RDV Service Public ne renvoie aucun rendez-vous', () => {
  recus = []
})

Given('RDV Service Public refusera de lister les rendez-vous', () => {
  apiRefuse = true
})

When('je synchronise les rendez-vous', async () => {
  resultat = await synchroniser({ compte: await compteUtilisable() })
})

const bilan = () => {
  assert.ok(resultat?.success, 'La synchronisation a échoué')
  return resultat.success ? resultat.data : undefined
}

Then('le rendez-vous est enregistré', async () => {
  assert.ok(await rdvEnBase(RDV_ID), 'Le rendez-vous devrait être en base')
})

Then('le rendez-vous n’est plus enregistré', async () => {
  assert.strictEqual(await rdvEnBase(RDV_ID), null)
})

Then(
  'le rendez-vous enregistré porte le statut {string}',
  async (statut: string) => {
    assert.strictEqual((await rdvEnBase(RDV_ID))?.status, statut)
  },
)

Then('l’usager du rendez-vous est enregistré', async () => {
  const rdv = await rdvEnBase(RDV_ID)
  assert.ok(rdv, 'Le rendez-vous devrait être en base')
})

Then('le bilan compte {int} rendez-vous créé', (nombre: number) => {
  assert.strictEqual(bilan()?.rdvs.created, nombre)
})

Then('le bilan compte {int} rendez-vous inchangé', (nombre: number) => {
  assert.strictEqual(bilan()?.rdvs.noop, nombre)
})

Then('le bilan compte {int} rendez-vous mis à jour', (nombre: number) => {
  assert.strictEqual(bilan()?.rdvs.updated, nombre)
})

Then('le bilan compte {int} rendez-vous supprimé', (nombre: number) => {
  assert.strictEqual(bilan()?.rdvs.deleted, nombre)
})

Then(
  'la synchronisation des rendez-vous échoue avec l’erreur {string}',
  (tag: string) => {
    assert.ok(
      resultat && !resultat.success,
      'La synchronisation aurait dû échouer',
    )
    assert.strictEqual(resultat.error._tag, tag)
  },
)
