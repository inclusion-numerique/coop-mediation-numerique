import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type { CompteRdvLie } from '../../../domain/compte/compte-rdv'
import { JetonAcces } from '../../../domain/compte/jetons-oauth'
import { AccesRefuse, ApiIndisponible } from '../../../domain/errors'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
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
