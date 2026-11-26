import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type { CompteRdvLie } from '../../../domain/compte/compte-rdv'
import { JetonAcces } from '../../../domain/compte/jetons-oauth'
import { AccesRefuse, ApiIndisponible } from '../../../domain/errors'
import { MotifId } from '../../../domain/identifiants/motif-id'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
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
import type { Rdv, RdvSynchronise } from '../../../domain/rdv/rdv'
import { StatutPresence } from '../../../domain/rdv/statut-presence'
import type { Usager } from '../../../domain/usager'
import {
  lieuFixture,
  motifFixture,
  participationFixture,
  rdvFixture,
  usagerFixture,
} from './fixtures'
import type { EtatConnu } from './plan-rdvs'
import { synchroniserRdvs } from './synchroniser-rdvs'

/**
 * Portée du ramassage des motifs orphelins.
 *
 * Le port l'exigeait naguère facultative, et l'absence valait « pas de filtre » :
 * la passe d'un compte supprimait alors les motifs de tous les autres, se les
 * imputait au bilan, et pouvait effacer un motif qu'une passe concurrente venait
 * de créer sans avoir encore écrit le rendez-vous qui le porte — la clé étrangère
 * faisait échouer cette passe-là. Une passe complète l'est pour son compte, pas
 * pour la base.
 */

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

const motifsOrphelinsEnBase = new Map([
  [accessible, 2],
  [inaccessible, 5],
])

const rdvsEnBase = new Map([
  [accessible, [RdvId(1)]],
  [inaccessible, [RdvId(2)]],
])

const dependances = {
  listerRdvs: async () => success([]),
  rdvsDejaImportes: async ({
    organisationIds,
  }: {
    readonly organisationIds?: readonly OrganisationId[]
  }) =>
    (organisationIds ?? compte.organisationIds).flatMap(
      (organisationId) => rdvsEnBase.get(organisationId) ?? [],
    ),
  etatConnuDuLot: async () => ({
    rdvs: new Map(),
    motifs: new Map(),
    lieux: new Map(),
    usagers: new Map(),
  }),
  appliquerPlan: async () => undefined,
  supprimerRdvs: async () => undefined,
  supprimerMotifsOrphelins: async (
    organisationIds: readonly OrganisationId[],
  ) =>
    organisationIds.reduce(
      (total, organisationId) =>
        total + (motifsOrphelinsEnBase.get(organisationId) ?? 0),
      0,
    ),
  rapprocherBeneficiaires: async () => undefined,
}

describe('ramassage des motifs orphelins', () => {
  it('se borne aux organisations du compte quand la passe est complète', async () => {
    const resultat = await synchroniserRdvs(dependances)({ compte })

    expect(resultat.success ? resultat.data.motifs.deleted : null).toBe(7)
  })

  it('se borne à la portée demandée quand la passe est restreinte', async () => {
    const resultat = await synchroniserRdvs(dependances)({
      compte,
      organisationIds: [inaccessible],
    })

    expect(resultat.success ? resultat.data.motifs.deleted : null).toBe(5)
  })
})

describe('organisation devenue inaccessible pendant un rattrapage', () => {
  const listerRdvsRefusant = async (
    _compte: unknown,
    filtres?: { organisationIds?: readonly OrganisationId[] },
  ) =>
    filtres?.organisationIds?.includes(inaccessible)
      ? failure(AccesRefuse('/rdvs', inaccessible))
      : success([])

  it('écarte l’organisation refusée et poursuit la passe sur les autres', async () => {
    const resultat = await synchroniserRdvs({
      ...dependances,
      listerRdvs: listerRdvsRefusant,
    })({ compte, organisationIds: [accessible, inaccessible] })

    expect(
      resultat.success
        ? {
            inaccessibles: resultat.data.organisationIdsInaccessibles,
            rdvsSupprimes: resultat.data.rdvs.deleted,
            motifsSupprimes: resultat.data.motifs.deleted,
          }
        : null,
    ).toEqual({
      inaccessibles: [inaccessible],
      rdvsSupprimes: 1,
      motifsSupprimes: 2,
    })
  })

  it('échoue quand une organisation échoue pour une autre raison qu’un refus d’accès', async () => {
    const resultat = await synchroniserRdvs({
      ...dependances,
      listerRdvs: async () =>
        failure(ApiIndisponible(503, 'service indisponible')),
    })({ compte, organisationIds: [accessible, inaccessible] })

    expect(resultat.success ? null : resultat.error._tag).toBe(
      'ApiIndisponible',
    )
  })

  it('ne connaît aucune organisation inaccessible sur une passe complète', async () => {
    const resultat = await synchroniserRdvs(dependances)({ compte })

    expect(
      resultat.success ? resultat.data.organisationIdsInaccessibles : null,
    ).toEqual([])
  })
})

const compteSuivi: CompteRdvLie = {
  ...compte,
  synchroniserDepuis: new Date('2026-01-15T00:00:00.000Z'),
}

const etatVide: EtatConnu = {
  rdvs: new Map(),
  motifs: new Map(),
  lieux: new Map(),
  usagers: new Map(),
}

const synchronise = (rdv: Rdv): RdvSynchronise => ({
  rdv,
  brut: { id: rdv.id },
})

const synchroniserLot = ({
  recus,
  connu = etatVide,
  enBase = [],
  tailleLot = 250,
}: {
  readonly recus: readonly RdvSynchronise[]
  readonly connu?: EtatConnu
  readonly enBase?: readonly RdvId[]
  readonly tailleLot?: number
}) =>
  synchroniserRdvs({
    listerRdvs: async () => success(recus),
    rdvsDejaImportes: async () => enBase,
    etatConnuDuLot: async () => connu,
    appliquerPlan: async () => undefined,
    supprimerRdvs: async () => undefined,
    supprimerMotifsOrphelins: async () => 0,
    rapprocherBeneficiaires: async () => undefined,
    tailleLot,
  })({ compte: compteSuivi })

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
  ...rdvFixture(1),
  collectif: true,
  nom: NomAtelier(nom),
  participantsMax: null,
})

describe('plan d’un lot de rendez-vous', () => {
  it('crée tout ce que La Coop ne connaît pas', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1))],
    })

    expect(resultat).toEqual(
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
        synchronise(rdvFixture(1)),
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
        synchronise(rdvFixture(1)),
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
              participationFixture(100, usagerFixture(200)),
              participationFixture(101, usagerFixture(201)),
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
      recus: [synchronise(rdvFixture(1)), synchronise(rdvFixture(2))],
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
      recus: [synchronise(rdvFixture(1)), synchronise(rdvFixture(2))],
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
      recus: [synchronise(rdvFixture(1)), synchronise(rdvFixture(2))],
      connu: {
        rdvs: new Map(),
        motifs: new Map([[MotifId(3), motifFixture(3)]]),
        lieux: new Map([[LieuId(11), lieuFixture(11)]]),
        usagers: new Map([[UsagerId(200), usagerFixture(200)]]),
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
      recus: [synchronise(rdvFixture(1)), synchronise(rdvFixture(2))],
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
      recus: [synchronise(rdvFixture(1))],
      connu: {
        ...etatVide,
        rdvs: new Map([[RdvId(1), rdvFixture(1)]]),
        motifs: new Map([[MotifId(3), motifFixture(3)]]),
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
      connu: lieuConnu(lieuFixture(11)),
    })

    expect(resultat).toMatchObject(
      success({ lieux: { updated: 1, created: 0 } }),
    )
  })
})

describe('rendez-vous disparus', () => {
  it('supprime ce que La Coop détient et que l’API ne renvoie plus', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1)), synchronise(rdvFixture(3))],
      enBase: [RdvId(1), RdvId(2), RdvId(3)],
    })

    expect(resultat).toMatchObject(success({ rdvs: { deleted: 1, count: 2 } }))
  })

  it('ne supprime rien quand tout est confirmé', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1))],
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
      recus: [synchronise(rdvFixture(1))],
      connu: motifConnu(motifFixture(3)),
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
      connu: motifConnu(motifFixture(3)),
    })

    expect(resultat).toMatchObject(success({ motifs: { updated: 1 } }))
  })
})

describe('changement d’un lieu', () => {
  it('ne voit rien changer entre deux copies', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1))],
      connu: lieuConnu(lieuFixture(11)),
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
      connu: lieuConnu(lieuFixture(11)),
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
              ),
            ],
          }),
        ),
      ],
      connu: usagerConnu(usagerFixture(200)),
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
              participationFixture(100, usagerFixture(200, changement)),
            ],
          }),
        ),
      ],
      connu: usagerConnu(usagerFixture(200)),
    })

    expect(resultat).toMatchObject(success({ usagers: { updated: 1 } }))
  })
})

describe('changement d’un rendez-vous', () => {
  it.each<[string, Rdv, Rdv]>([
    ['deux copies', rdvFixture(1), rdvFixture(1)],
    [
      'deux copies sans lieu',
      rdvFixture(1, { lieu: null }),
      rdvFixture(1, { lieu: null }),
    ],
    [
      'des préférences de notification d’une participation',
      rdvFixture(1),
      rdvFixture(1, {
        participations: [
          participationFixture(100, usagerFixture(200), {
            notificationRappel: true,
          }),
        ],
      }),
    ],
    [
      'l’identité d’un usager, réconciliée par ailleurs',
      rdvFixture(1),
      rdvFixture(1, {
        participations: [
          participationFixture(
            100,
            usagerFixture(200, { nom: NomExterne('Durand') }),
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
    ['le motif', rdvFixture(1, { motif: motifFixture(4) })],
    ['la disparition du motif', rdvFixture(1, { motif: null })],
    ['le lieu', rdvFixture(1, { lieu: lieuFixture(12) })],
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
          participationFixture(100, usagerFixture(200)),
          participationFixture(101, usagerFixture(201)),
        ],
      }),
    ],
    [
      'un participant remplacé à identifiant de participation égal',
      rdvFixture(1, {
        participations: [participationFixture(100, usagerFixture(999))],
      }),
    ],
    [
      'une participation remplacée par une autre',
      rdvFixture(1, {
        participations: [participationFixture(102, usagerFixture(200))],
      }),
    ],
    [
      'la présence d’un participant',
      rdvFixture(1, {
        participations: [
          participationFixture(100, usagerFixture(200), {
            statutPresence: StatutPresence('seen'),
          }),
        ],
      }),
    ],
    ['un passage en atelier collectif', atelier('Atelier CV')],
  ])('détecte un changement sur %s', async (_, recu) => {
    const resultat = await synchroniserLot({
      recus: [synchronise(recu)],
      connu: rdvConnu(rdvFixture(1)),
    })

    expect(resultat).toMatchObject(success({ rdvs: { updated: 1 } }))
  })

  it('détecte l’apparition d’un motif', async () => {
    const resultat = await synchroniserLot({
      recus: [synchronise(rdvFixture(1))],
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
    })({ compte })

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
      listerRdvs: async () => success([synchronise(rdvFixture(1))]),
    })({ compte, organisationIds: [accessible] })

    expect(resultat).toMatchObject(
      success({
        rdvs: { created: 1, count: 1 },
        organisationIdsInaccessibles: [],
      }),
    )
  })
})
