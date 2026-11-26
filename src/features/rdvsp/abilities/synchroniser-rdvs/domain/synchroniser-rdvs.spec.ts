import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type { CompteRdvLie } from '../../../domain/compte/compte-rdv'
import { JetonAcces } from '../../../domain/compte/jetons-oauth'
import {
  AccesRefuse,
  ApiIndisponible,
  ErreurTechnique,
} from '../../../domain/errors'
import { MotifId } from '../../../domain/identifiants/motif-id'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { ParticipationId } from '../../../domain/identifiants/participation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { RdvUuid } from '../../../domain/identifiants/rdv-uuid'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../../domain/identite'
import { NomAtelier, NomMotif } from '../../../domain/libelle'
import { AdresseRdv } from '../../../domain/rdv/adresse-rdv'
import { DureeEnMinutes } from '../../../domain/rdv/duree-en-minutes'
import { type Lieu, LieuId, NomLieu } from '../../../domain/rdv/lieu'
import { CategorieMotifId, type Motif } from '../../../domain/rdv/motif'
import type { Participation } from '../../../domain/rdv/participation'
import type { Rdv, RdvSynchronise } from '../../../domain/rdv/rdv'
import { StatutPresence } from '../../../domain/rdv/statut-presence'
import { UrlAgent } from '../../../domain/url-agent'
import type { Usager } from '../../../domain/usager'
import type { EtatConnu } from './plan-rdvs'
import type { SynchroniserRdvsPorts } from './ports'
import { synchroniserRdvs } from './synchroniser-rdvs'

const usagerFixture = (id: number, surcharge: Partial<Usager>): Usager => ({
  id: UsagerId(id),
  prenom: PrenomExterne('Jean'),
  nom: NomExterne('Dupont'),
  email: EmailExterne('jean.dupont@example.com'),
  telephone: null,
  telephoneFormate: null,
  creation: null,
  invitationCreee: null,
  invitationAcceptee: null,
  dateNaissance: null,
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
  ...surcharge,
})

const motifFixture = (id: number, surcharge: Partial<Motif>): Motif => ({
  id: MotifId(id),
  nom: NomMotif('Accompagnement numérique'),
  collectif: false,
  organisationId: OrganisationId(7),
  suivi: false,
  instruction: null,
  typeDeLieu: null,
  categorieId: null,
  ...surcharge,
})

const lieuFixture = (id: number, surcharge: Partial<Lieu>): Lieu => ({
  id: LieuId(id),
  nom: NomLieu('Médiathèque'),
  adresse: AdresseRdv('1 place du Marché, 44000 Nantes'),
  organisationId: OrganisationId(7),
  telephone: null,
  usageUnique: false,
  ...surcharge,
})

const participationFixture = (
  id: number,
  usager: Usager,
  surcharge: Partial<Participation>,
): Participation => ({
  id: ParticipationId(id),
  usagerId: usager.id,
  usager,
  statutPresence: StatutPresence('unknown'),
  notificationRappel: false,
  notificationsCycleDeVie: false,
  ...surcharge,
})

const rdvFixture = (
  id: number,
  surcharge: Partial<Extract<Rdv, { collectif: false }>>,
): Rdv => ({
  id: RdvId(id),
  uuid: RdvUuid(`00000000-0000-4000-8000-${String(id).padStart(12, '0')}`),
  agentId: RdvAgentId(4242),
  organisationId: OrganisationId(7),
  adresse: AdresseRdv('12 rue de la Paix, 75002 Paris'),
  debut: new Date('2026-08-18T09:00:00.000Z'),
  fin: new Date('2026-08-18T10:00:00.000Z'),
  duree: DureeEnMinutes(60),
  statutPresence: StatutPresence('unknown'),
  urlAgent: UrlAgent(`https://rdv.anct.gouv.fr/admin/rdvs/${id}`),
  nombreParticipants: 1,
  contexte: null,
  creeParId: null,
  annulation: null,
  motif: motifFixture(3, {}),
  lieu: lieuFixture(11, {}),
  participations: [participationFixture(100, usagerFixture(200, {}), {})],
  collectif: false,
  ...surcharge,
})

const compte: CompteRdvLie = {
  _tag: 'lie',
  agentId: RdvAgentId(9546),
  utilisateurId: UtilisateurCoopId('11111111-1111-4111-8111-111111111111'),
  organisationIds: [OrganisationId(3089), OrganisationId(3090)],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
  jetons: {
    acces: JetonAcces('acces'),
    rafraichissement: null,
    expiration: null,
    portee: null,
  },
}

const accessible = OrganisationId(3089)
const inaccessible = OrganisationId(3090)
const mediateurId = '11111111-1111-4111-8111-111111111112'
const panne = ErreurTechnique(new Error('connexion perdue'))

const etatInconnu: EtatConnu = {
  rdvs: new Map(),
  motifs: new Map(),
  lieux: new Map(),
  usagers: new Map(),
}

const dependances: SynchroniserRdvsPorts = {
  listerRdvs: async () => success([]),
  rdvsDejaImportes: async () => success([RdvId(1)]),
  etatConnuDuLot: async () => success(etatInconnu),
  appliquerPlan: async () => success(undefined),
  supprimerRdvs: async () => success(undefined),
  supprimerMotifsOrphelins: async () => success(2),
  lireLesUsagersARapprocher: async () => success([]),
  rapprocherLesBeneficiaires: async () => success({ ecartes: 0 }),
}

const passe = { compte, mediateurId, tailleLot: 250 }

describe('ramassage des motifs orphelins', () => {
  it('se borne aux organisations du compte quand la passe est complète', async () => {
    expect(await synchroniserRdvs(dependances)(passe)).toMatchObject(
      success({
        motifsOrphelinsDans: [accessible, inaccessible],
        motifs: { deleted: 2 },
      }),
    )
  })

  it('se borne à la portée demandée quand la passe est restreinte', async () => {
    expect(
      await synchroniserRdvs(dependances)({
        ...passe,
        organisationIds: [accessible],
      }),
    ).toMatchObject(success({ motifsOrphelinsDans: [accessible] }))
  })
})

describe('organisation devenue inaccessible pendant un rattrapage', () => {
  it('écarte l’organisation refusée et poursuit la passe sans elle', async () => {
    expect(
      await synchroniserRdvs({
        ...dependances,
        listerRdvs: async () => failure(AccesRefuse('/rdvs', inaccessible)),
      })({ ...passe, organisationIds: [inaccessible] }),
    ).toMatchObject(
      success({
        organisationIdsInaccessibles: [inaccessible],
        motifsOrphelinsDans: [],
        rdvsSupprimes: [RdvId(1)],
      }),
    )
  })

  it('échoue quand une organisation échoue pour une autre raison qu’un refus d’accès', async () => {
    expect(
      await synchroniserRdvs({
        ...dependances,
        listerRdvs: async () =>
          failure(ApiIndisponible(503, 'service indisponible')),
      })({ ...passe, organisationIds: [accessible, inaccessible] }),
    ).toEqual(
      failure({
        _tag: 'ApiIndisponible',
        statusCode: 503,
        message: 'service indisponible',
      }),
    )
  })

  it('ne connaît aucune organisation inaccessible sur une passe complète', async () => {
    expect(await synchroniserRdvs(dependances)(passe)).toMatchObject(
      success({ organisationIdsInaccessibles: [] }),
    )
  })
})

describe('échecs techniques', () => {
  it.each<{ cas: string; ports: Partial<SynchroniserRdvsPorts> }>([
    {
      cas: 'la lecture des rendez-vous détenus',
      ports: { rdvsDejaImportes: async () => failure(panne) },
    },
    {
      cas: 'la lecture de l’état connu d’un lot',
      ports: { etatConnuDuLot: async () => failure(panne) },
    },
    {
      cas: 'l’écriture d’un lot',
      ports: { appliquerPlan: async () => failure(panne) },
    },
    {
      cas: 'la suppression des rendez-vous disparus',
      ports: { supprimerRdvs: async () => failure(panne) },
    },
    {
      cas: 'le ramassage des motifs orphelins',
      ports: { supprimerMotifsOrphelins: async () => failure(panne) },
    },
  ])('rend l’échec de $cas', async ({ ports }) => {
    expect(
      await synchroniserRdvs({
        ...dependances,
        listerRdvs: async () => success([synchronise(rdvFixture(1, {}))]),
        ...ports,
      })(passe),
    ).toEqual(failure(panne))
  })
})

describe('échec au milieu des lots', () => {
  it('n’écrit plus rien après le lot en échec', async () => {
    expect(
      await synchroniserRdvs({
        ...dependances,
        listerRdvs: async () =>
          success([
            synchronise(rdvFixture(1, {})),
            synchronise(rdvFixture(2, {})),
          ]),
        etatConnuDuLot: async () => failure(panne),
      })({ ...passe, tailleLot: 1 }),
    ).toEqual(failure(panne))
  })
})

describe('rapprochement des bénéficiaires', () => {
  it('rapproche les usagers créés ou mis à jour par chaque lot', async () => {
    expect(
      await synchroniserRdvs({
        ...dependances,
        listerRdvs: async () => success([synchronise(rdvFixture(1, {}))]),
      })(passe),
    ).toMatchObject(
      success({
        rapprochements: [
          { _tag: 'reussi', usagers: [], mediateurId, ecartes: 0 },
        ],
      }),
    )
  })
})

const compteSuivi: CompteRdvLie = {
  ...compte,
  synchroniserDepuis: new Date('2026-01-15T00:00:00.000Z'),
}

const etatVide: EtatConnu = etatInconnu

const synchronise = (rdv: Rdv): RdvSynchronise => ({
  rdv,
  brut: { id: rdv.id },
})

const synchroniserLot = (surcharge: {
  readonly recus: readonly RdvSynchronise[]
  readonly connu?: EtatConnu
  readonly enBase?: readonly RdvId[]
  readonly tailleLot?: number
}) => {
  const { recus, connu, enBase, tailleLot } = {
    connu: etatVide,
    enBase: [],
    tailleLot: 250,
    ...surcharge,
  }

  return synchroniserRdvs({
    ...dependances,
    listerRdvs: async () => success(recus),
    rdvsDejaImportes: async () => success(enBase),
    etatConnuDuLot: async () => success(connu),
    supprimerMotifsOrphelins: async () => success(0),
  })({ compte: compteSuivi, mediateurId, tailleLot })
}

const rdvConnu = (rdv: Rdv): EtatConnu => ({
  ...etatVide,
  rdvs: new Map([[rdv.id, rdv]]),
})

const motifConnu = (motif: Motif): EtatConnu => ({
  ...etatVide,
  motifs: new Map([[motif.id, motif]]),
})

const lieuConnu = (lieu: Lieu): EtatConnu => ({
  ...etatVide,
  lieux: new Map([[lieu.id, lieu]]),
})

const usagerConnu = (usager: Usager): EtatConnu => ({
  ...etatVide,
  usagers: new Map([[usager.id, usager]]),
})

const atelier = (nom: string): Rdv => ({
  ...rdvFixture(1, {}),
  collectif: true,
  nom: NomAtelier(nom),
  participantsMax: null,
})

describe('plan d’un lot de rendez-vous', () => {
  it('crée tout ce que La Coop ne connaît pas', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {}))],
    })

    expect(resultat).toMatchObject(
      success({
        rdvs: { noop: 0, created: 1, updated: 0, deleted: 0, count: 1 },
        usagers: { noop: 0, created: 1, updated: 0, deleted: 0, count: 1 },
        motifs: { noop: 0, created: 1, updated: 0, deleted: 0, count: 1 },
        lieux: { noop: 0, created: 1, updated: 0, deleted: 0, count: 1 },
        organisationIdsInaccessibles: [],
      }),
    )
  })

  it('écarte les rendez-vous qui n’ont pas de motif', async () => {
    const resultat = await synchroniserLot({
      recus: [
        synchronise(rdvFixture(1, {})),
        synchronise(rdvFixture(2, { motif: null })),
      ],
    })

    expect(resultat).toMatchObject(
      success({ motifs: { created: 1, count: 1 } }),
    )
  })

  it('écarte les rendez-vous qui n’ont pas de lieu', async () => {
    const resultat = await synchroniserLot({
      recus: [
        synchronise(rdvFixture(1, {})),
        synchronise(rdvFixture(2, { lieu: null })),
      ],
    })

    expect(resultat).toMatchObject(success({ lieux: { created: 1, count: 1 } }))
  })

  it('remonte les usagers de toutes les participations', async () => {
    const resultat = await synchroniserLot({
      recus: [
        synchronise(
          rdvFixture(1, {
            participations: [
              participationFixture(100, usagerFixture(200, {}), {}),
              participationFixture(101, usagerFixture(201, {}), {}),
            ],
          }),
        ),
      ],
    })

    expect(resultat).toMatchObject(
      success({ usagers: { created: 2, count: 2 } }),
    )
  })

  it('dédoublonne un motif, un lieu et un usager portés par plusieurs rendez-vous', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {})), synchronise(rdvFixture(2, {}))],
    })

    expect(resultat).toMatchObject(
      success({
        rdvs: { created: 2 },
        usagers: { created: 1 },
        motifs: { created: 1 },
        lieux: { created: 1 },
      }),
    )
  })

  it('écarte ce qu’un lot précédent a déjà créé', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {})), synchronise(rdvFixture(2, {}))],
      tailleLot: 1,
    })

    expect(resultat).toMatchObject(
      success({
        rdvs: { created: 2, count: 2 },
        usagers: { created: 1, count: 1 },
        motifs: { created: 1, count: 1 },
        lieux: { created: 1, count: 1 },
      }),
    )
  })

  it('écarte ce qu’un lot précédent a déjà trouvé inchangé', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {})), synchronise(rdvFixture(2, {}))],
      connu: {
        rdvs: new Map(),
        motifs: new Map([[MotifId(3), motifFixture(3, {})]]),
        lieux: new Map([[LieuId(11), lieuFixture(11, {})]]),
        usagers: new Map([[UsagerId(200), usagerFixture(200, {})]]),
      },
      tailleLot: 1,
    })

    expect(resultat).toMatchObject(
      success({
        usagers: { noop: 1, count: 1 },
        motifs: { noop: 1, count: 1 },
        lieux: { noop: 1, count: 1 },
      }),
    )
  })

  it('écarte ce qu’un lot précédent a déjà mis à jour', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {})), synchronise(rdvFixture(2, {}))],
      connu: {
        rdvs: new Map(),
        motifs: new Map([
          [MotifId(3), motifFixture(3, { nom: NomMotif('Ancien motif') })],
        ]),
        lieux: new Map([
          [LieuId(11), lieuFixture(11, { nom: NomLieu('Ancien lieu') })],
        ]),
        usagers: new Map([
          [UsagerId(200), usagerFixture(200, { nom: NomExterne('Durand') })],
        ]),
      },
      tailleLot: 1,
    })

    expect(resultat).toMatchObject(
      success({
        usagers: { updated: 1, count: 1 },
        motifs: { updated: 1, count: 1 },
        lieux: { updated: 1, count: 1 },
      }),
    )
  })

  it('laisse tranquille un rendez-vous identique à ce qui est connu', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {}))],
      connu: {
        ...etatVide,
        rdvs: new Map([[RdvId(1), rdvFixture(1, {})]]),
        motifs: new Map([[MotifId(3), motifFixture(3, {})]]),
      },
    })

    expect(resultat).toMatchObject(
      success({ rdvs: { noop: 1, updated: 0 }, motifs: { noop: 1 } }),
    )
  })

  it('met à jour un lieu retouché sans toucher aux autres modèles', async () => {
    const resultat = await synchroniserLot({
      recus: [
        synchronise(
          rdvFixture(1, {
            lieu: lieuFixture(11, { nom: NomLieu('Médiathèque rénovée') }),
          }),
        ),
      ],
      connu: lieuConnu(lieuFixture(11, {})),
    })

    expect(resultat).toMatchObject(
      success({ lieux: { updated: 1, created: 0 } }),
    )
  })
})

describe('rendez-vous disparus', () => {
  it('supprime ce que La Coop détient et que l’API ne renvoie plus', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {})), synchronise(rdvFixture(3, {}))],
      enBase: [RdvId(1), RdvId(2), RdvId(3)],
    })

    expect(resultat).toMatchObject(success({ rdvs: { deleted: 1, count: 2 } }))
  })

  it('ne supprime rien quand tout est confirmé', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {}))],
      enBase: [RdvId(1)],
    })

    expect(resultat).toMatchObject(success({ rdvs: { deleted: 0 } }))
  })

  it('supprime tout si l’API ne renvoie plus rien', async () => {
    const resultat = await synchroniserLot({ recus: [], enBase: [RdvId(1)] })

    expect(resultat).toMatchObject(success({ rdvs: { deleted: 1, count: 0 } }))
  })
})

describe('changement d’un motif', () => {
  it('ne voit rien changer entre deux copies', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {}))],
      connu: motifConnu(motifFixture(3, {})),
    })

    expect(resultat).toMatchObject(success({ motifs: { noop: 1 } }))
  })

  it.each<[string, Partial<Motif>]>([
    ['le libellé', { nom: NomMotif('Autre motif') }],
    ['le caractère collectif', { collectif: true }],
    ['l’organisation', { organisationId: OrganisationId(9) }],
    ['le suivi', { suivi: true }],
    ['l’instruction', { instruction: 'Munissez-vous de votre pièce' }],
    ['le type de lieu', { typeDeLieu: 'phone' }],
    ['la catégorie', { categorieId: CategorieMotifId(2) }],
  ])('détecte un changement sur %s', async (_, changement) => {
    const resultat = await synchroniserLot({
      recus: [
        synchronise(rdvFixture(1, { motif: motifFixture(3, changement) })),
      ],
      connu: motifConnu(motifFixture(3, {})),
    })

    expect(resultat).toMatchObject(success({ motifs: { updated: 1 } }))
  })
})

describe('changement d’un lieu', () => {
  it('ne voit rien changer entre deux copies', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {}))],
      connu: lieuConnu(lieuFixture(11, {})),
    })

    expect(resultat).toMatchObject(success({ lieux: { noop: 1 } }))
  })

  it.each<[string, Partial<Lieu>]>([
    ['le nom', { nom: NomLieu('Autre lieu') }],
    ['l’adresse', { adresse: AdresseRdv('2 rue Neuve, 44000 Nantes') }],
    ['le téléphone', { telephone: TelephoneExterne('+33240000000') }],
    ['l’usage unique', { usageUnique: true }],
    ['l’organisation', { organisationId: OrganisationId(9) }],
  ])('détecte un changement sur %s', async (_, changement) => {
    const resultat = await synchroniserLot({
      recus: [
        synchronise(rdvFixture(1, { lieu: lieuFixture(11, changement) })),
      ],
      connu: lieuConnu(lieuFixture(11, {})),
    })

    expect(resultat).toMatchObject(success({ lieux: { updated: 1 } }))
  })
})

describe('changement d’un usager', () => {
  it('ne compare que l’identité', async () => {
    const resultat = await synchroniserLot({
      recus: [
        synchronise(
          rdvFixture(1, {
            participations: [
              participationFixture(
                100,
                usagerFixture(200, { notifierParSms: true }),
                {},
              ),
            ],
          }),
        ),
      ],
      connu: usagerConnu(usagerFixture(200, {})),
    })

    expect(resultat).toMatchObject(success({ usagers: { noop: 1 } }))
  })

  it.each<[string, Partial<Usager>]>([
    ['le prénom', { prenom: PrenomExterne('Jeanne') }],
    ['le nom', { nom: NomExterne('Durand') }],
    ['l’e-mail', { email: EmailExterne('autre@example.com') }],
  ])('détecte un changement sur %s', async (_, changement) => {
    const resultat = await synchroniserLot({
      recus: [
        synchronise(
          rdvFixture(1, {
            participations: [
              participationFixture(100, usagerFixture(200, changement), {}),
            ],
          }),
        ),
      ],
      connu: usagerConnu(usagerFixture(200, {})),
    })

    expect(resultat).toMatchObject(success({ usagers: { updated: 1 } }))
  })
})

describe('changement d’un rendez-vous', () => {
  it.each<[string, Rdv, Rdv]>([
    ['deux copies', rdvFixture(1, {}), rdvFixture(1, {})],
    [
      'deux copies sans lieu',
      rdvFixture(1, { lieu: null }),
      rdvFixture(1, { lieu: null }),
    ],
    [
      'des préférences de notification d’une participation',
      rdvFixture(1, {}),
      rdvFixture(1, {
        participations: [
          participationFixture(100, usagerFixture(200, {}), {
            notificationRappel: true,
          }),
        ],
      }),
    ],
    [
      'l’identité d’un usager, réconciliée par ailleurs',
      rdvFixture(1, {}),
      rdvFixture(1, {
        participations: [
          participationFixture(
            100,
            usagerFixture(200, { nom: NomExterne('Durand') }),
            {},
          ),
        ],
      }),
    ],
  ])('ne voit rien changer avec %s', async (_, connu, recu) => {
    const resultat = await synchroniserLot({
      recus: [synchronise(recu)],
      connu: rdvConnu(connu),
    })

    expect(resultat).toMatchObject(success({ rdvs: { noop: 1, updated: 0 } }))
  })

  it.each<[string, Rdv]>([
    ['le statut', rdvFixture(1, { statutPresence: StatutPresence('seen') })],
    ['la durée', rdvFixture(1, { duree: DureeEnMinutes(30) })],
    [
      'le début',
      rdvFixture(1, { debut: new Date('2026-08-18T14:00:00.000Z') }),
    ],
    ['la fin', rdvFixture(1, { fin: new Date('2026-08-18T11:00:00.000Z') })],
    ['l’organisation', rdvFixture(1, { organisationId: OrganisationId(9) })],
    ['le motif', rdvFixture(1, { motif: motifFixture(4, {}) })],
    ['la disparition du motif', rdvFixture(1, { motif: null })],
    ['le lieu', rdvFixture(1, { lieu: lieuFixture(12, {}) })],
    ['la disparition du lieu', rdvFixture(1, { lieu: null })],
    [
      'un lieu retouché derrière un rendez-vous par ailleurs identique',
      rdvFixture(1, {
        lieu: lieuFixture(11, { nom: NomLieu('Médiathèque rénovée') }),
      }),
    ],
    [
      'un participant en plus',
      rdvFixture(1, {
        participations: [
          participationFixture(100, usagerFixture(200, {}), {}),
          participationFixture(101, usagerFixture(201, {}), {}),
        ],
      }),
    ],
    [
      'un participant remplacé à identifiant de participation égal',
      rdvFixture(1, {
        participations: [participationFixture(100, usagerFixture(999, {}), {})],
      }),
    ],
    [
      'une participation remplacée par une autre',
      rdvFixture(1, {
        participations: [participationFixture(102, usagerFixture(200, {}), {})],
      }),
    ],
    [
      'la présence d’un participant',
      rdvFixture(1, {
        participations: [
          participationFixture(100, usagerFixture(200, {}), {
            statutPresence: StatutPresence('seen'),
          }),
        ],
      }),
    ],
    ['un passage en atelier collectif', atelier('Atelier CV')],
  ])('détecte un changement sur %s', async (_, recu) => {
    const resultat = await synchroniserLot({
      recus: [synchronise(recu)],
      connu: rdvConnu(rdvFixture(1, {})),
    })

    expect(resultat).toMatchObject(success({ rdvs: { updated: 1 } }))
  })

  it('détecte l’apparition d’un motif', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1, {}))],
      connu: rdvConnu(rdvFixture(1, { motif: null })),
    })

    expect(resultat).toMatchObject(success({ rdvs: { updated: 1 } }))
  })

  it('compare le nom d’atelier des rendez-vous collectifs', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(atelier('Atelier emploi'))],
      connu: rdvConnu(atelier('Atelier CV')),
    })

    expect(resultat).toMatchObject(success({ rdvs: { updated: 1 } }))
  })
})

describe('lecture des rendez-vous', () => {
  it('échoue sans rien écrire quand la lecture d’une passe complète échoue', async () => {
    const resultat = await synchroniserRdvs({
      ...dependances,
      listerRdvs: async () => failure(ApiIndisponible(503, 'maintenance')),
    })(passe)

    expect(resultat).toEqual(
      failure({
        _tag: 'ApiIndisponible',
        statusCode: 503,
        message: 'maintenance',
      }),
    )
  })

  it('planifie les rendez-vous d’une passe restreinte à une organisation', async () => {
    const resultat = await synchroniserRdvs({
      ...dependances,
      listerRdvs: async () => success([synchronise(rdvFixture(1, {}))]),
    })({ ...passe, organisationIds: [accessible] })

    expect(resultat).toMatchObject(
      success({
        rdvs: { created: 1, count: 1 },
        organisationIdsInaccessibles: [],
      }),
    )
  })
})
