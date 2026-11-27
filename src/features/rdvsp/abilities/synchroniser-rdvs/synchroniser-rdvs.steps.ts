import assert from 'node:assert'
import { Given, Then, When, type World } from '@cucumber/cucumber'
import { synchroniserRdvs } from '@/features/rdvsp/abilities/synchroniser-rdvs/domain/synchroniser-rdvs'
import {
  appliquerPlanLot,
  supprimerMotifsOrphelins,
  supprimerRdvs,
} from '@/features/rdvsp/abilities/synchroniser-rdvs/implementations/prisma/appliquer-plan-lot.mutation'
import {
  etatConnuDuLot,
  rdvsDejaImportes,
} from '@/features/rdvsp/abilities/synchroniser-rdvs/implementations/prisma/etat-connu.query'
import {
  type CompteRdvUtilisable,
  estUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import { ApiIndisponible } from '@/features/rdvsp/domain/errors'
import { MediateurId } from '@/features/rdvsp/domain/identifiants/mediateur-id'
import { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import { ParticipationId } from '@/features/rdvsp/domain/identifiants/participation-id'
import { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import { RdvUuid } from '@/features/rdvsp/domain/identifiants/rdv-uuid'
import { UsagerId } from '@/features/rdvsp/domain/identifiants/usager-id'
import { NomExterne, PrenomExterne } from '@/features/rdvsp/domain/identite'
import { toutesOrganisations } from '@/features/rdvsp/domain/portee-de-synchronisation'
import { AdresseRdv } from '@/features/rdvsp/domain/rdv/adresse-rdv'
import { DureeEnMinutes } from '@/features/rdvsp/domain/rdv/duree-en-minutes'
import type { Rdv, RdvSynchronise } from '@/features/rdvsp/domain/rdv/rdv'
import { StatutPresence } from '@/features/rdvsp/domain/rdv/statut-presence'
import { TAILLE_DES_LOTS_DE_RDVS } from '@/features/rdvsp/domain/rdv/taille-des-lots'
import { UrlAgent } from '@/features/rdvsp/domain/url-agent'
import type { Usager } from '@/features/rdvsp/domain/usager'
import { compteRdvToDomain } from '@/features/rdvsp/implementations/prisma/compte-rdv.transfer'
import {
  compteRdvEnBase,
  ID_TEST,
  rdvEnBase,
  seedCompteRdv,
  seedOrganisation,
  seedParticipation,
  seedRdv,
  suivreUsagerRdv,
} from '@/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@/libraries/result'

const AGENT_ID = ID_TEST.compte + 10
const RDV_ID = ID_TEST.rdv + 300
const ORGANISATION_ID = ID_TEST.organisation + 300
const USAGER_ID = ID_TEST.usager + 300
const PARTICIPATION_ID = ID_TEST.participation + 300

type Monde = World & {
  recus?: RdvSynchronise[]
  apiRefuse?: boolean
  resultat?: Awaited<ReturnType<ReturnType<typeof synchroniserPour>>>
}

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

const synchroniserPour = (monde: Monde) =>
  synchroniserRdvs({
    listerRdvs: async () =>
      monde.apiRefuse
        ? failure(ApiIndisponible(503, 'service indisponible'))
        : success(monde.recus ?? []),
    rdvsDejaImportes,
    etatConnuDuLot,
    appliquerPlan: appliquerPlanLot,
    supprimerRdvs,
    supprimerMotifsOrphelins,
    lireLesUsagersARapprocher: async () => success([]),
    rapprocherLesBeneficiaires: async () => success({ skipped: [] }),
  })

const compteUtilisable = async (): Promise<CompteRdvUtilisable> => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.ok(row, 'Aucun compte RDV en base')
  const compte = compteRdvToDomain(row)
  assert.ok(estUtilisable(compte), 'Le compte devrait être utilisable')
  return compte
}

Given('un compte RDV à synchroniser', async () => {
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  await seedOrganisation({ id: ORGANISATION_ID })
  suivreUsagerRdv(USAGER_ID)
})

Given(
  'RDV Service Public renvoie un rendez-vous à venir',
  function (this: Monde) {
    this.recus = [{ rdv: rdvRecu('unknown'), brut: { id: RDV_ID } }]
  },
)

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
  function (this: Monde, statut: string) {
    this.recus = [{ rdv: rdvRecu(statut), brut: { id: RDV_ID } }]
  },
)

Given(
  'RDV Service Public ne renvoie aucun rendez-vous',
  function (this: Monde) {
    this.recus = []
  },
)

Given(
  'RDV Service Public refusera de lister les rendez-vous',
  function (this: Monde) {
    this.apiRefuse = true
  },
)

When('je synchronise les rendez-vous', async function (this: Monde) {
  this.resultat = await synchroniserPour(this)({
    compte: await compteUtilisable(),
    portee: toutesOrganisations,
    mediateurId: MediateurId('b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b'),
    tailleLot: TAILLE_DES_LOTS_DE_RDVS,
    maintenant: new Date(),
  })
})

const bilan = ({ resultat }: Monde) => {
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

Then(
  'le bilan compte {int} rendez-vous créé',
  function (this: Monde, nombre: number) {
    assert.strictEqual(bilan(this)?.rdvs.created, nombre)
  },
)

Then(
  'le bilan compte {int} rendez-vous inchangé',
  function (this: Monde, nombre: number) {
    assert.strictEqual(bilan(this)?.rdvs.noop, nombre)
  },
)

Then(
  'le bilan compte {int} rendez-vous mis à jour',
  function (this: Monde, nombre: number) {
    assert.strictEqual(bilan(this)?.rdvs.updated, nombre)
  },
)

Then(
  'le bilan compte {int} rendez-vous supprimé',
  function (this: Monde, nombre: number) {
    assert.strictEqual(bilan(this)?.rdvs.deleted, nombre)
  },
)

Then(
  'la synchronisation des rendez-vous échoue avec l’erreur {string}',
  function (this: Monde, tag: string) {
    assert.ok(
      this.resultat && !this.resultat.success,
      'La synchronisation aurait dû échouer',
    )
    assert.strictEqual(this.resultat.error._tag, tag)
  },
)
