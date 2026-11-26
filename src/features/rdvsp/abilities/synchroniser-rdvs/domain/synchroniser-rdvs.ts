import {
  type RdvsLus,
  rassemblerLectures,
} from '@/features/rdvsp/abilities/synchroniser-rdvs/domain/lectures-par-organisation'
import {
  type BilanModele,
  bilanDuPlan,
  bilanVide,
  cumulerBilans,
} from '@/features/rdvsp/abilities/synchroniser-rdvs/domain/plan-modele'
import {
  type DejaTraites,
  type PlanLot,
  planifierLot,
  rdvsASupprimer,
} from '@/features/rdvsp/abilities/synchroniser-rdvs/domain/plan-rdvs'
import type { CompteRdvUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import type { ErreurRdvApi } from '@/features/rdvsp/domain/errors'
import {
  type OrganisationId,
  organisationsAccessibles,
} from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import type { RdvServicePublicApi } from '@/features/rdvsp/domain/ports'
import {
  type Rapprochement,
  rapprocherLesUsagers,
} from '@/features/rdvsp/domain/rapprochement'
import type { RdvSynchronise } from '@/features/rdvsp/domain/rdv/rdv'
import { type Result, success } from '@/libraries/result'
import type { EchecDeSynchroniserRdvs } from './errors'
import type { SynchroniserRdvsPorts } from './ports'

type BilanCompte = BilanModele & { readonly count: number }

export type RdvsSynchronises = {
  readonly rdvs: BilanCompte
  readonly usagers: BilanCompte
  readonly motifs: BilanCompte
  readonly lieux: BilanCompte
  readonly organisationIdsInaccessibles: readonly OrganisationId[]
  readonly lots: readonly PlanLot[]
  readonly rapprochements: readonly Rapprochement[]
  readonly rdvsSupprimes: readonly RdvId[]
  readonly motifsOrphelinsDans: readonly OrganisationId[]
}

const lireRdvs = async (
  listerRdvs: RdvServicePublicApi['listerRdvs'],
  compte: CompteRdvUtilisable,
  organisationIds: readonly OrganisationId[] | undefined,
): Promise<Result<RdvsLus, ErreurRdvApi>> => {
  const filtres = {
    agentId: compte.agentId,
    ...(compte.synchroniserDepuis == null
      ? {}
      : { debutApres: compte.synchroniserDepuis }),
  }

  if (organisationIds === undefined) {
    const recus = await listerRdvs(compte, filtres)

    return recus.success
      ? success({ rdvs: recus.data, organisationIdsInaccessibles: [] })
      : recus
  }

  return rassemblerLectures(
    await Promise.all(
      organisationIds.map(async (organisationId) => ({
        organisationId,
        resultat: await listerRdvs(compte, {
          ...filtres,
          organisationIds: [organisationId],
        }),
      })),
    ),
  )
}

const decouper = <T>(elements: readonly T[], taille: number): T[][] =>
  Array.from({ length: Math.ceil(elements.length / taille) }, (_, index) =>
    elements.slice(index * taille, (index + 1) * taille),
  )

type Cumul = {
  readonly rdvs: BilanModele
  readonly usagers: BilanModele
  readonly motifs: BilanModele
  readonly lieux: BilanModele
  readonly traites: DejaTraites
  readonly lots: readonly PlanLot[]
  readonly rapprochements: readonly Rapprochement[]
}

const cumulVide: Cumul = {
  rdvs: bilanVide,
  usagers: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
  traites: { motifs: new Set(), lieux: new Set(), usagers: new Set() },
  lots: [],
  rapprochements: [],
}

const cumuler = (
  acquis: Cumul,
  plan: PlanLot,
  rapprochement: Rapprochement,
): Cumul => ({
  rdvs: cumulerBilans(acquis.rdvs, bilanDuPlan(plan.rdvs)),
  usagers: cumulerBilans(acquis.usagers, bilanDuPlan(plan.usagers)),
  motifs: cumulerBilans(acquis.motifs, bilanDuPlan(plan.motifs)),
  lieux: cumulerBilans(acquis.lieux, bilanDuPlan(plan.lieux)),
  traites: {
    motifs: new Set([
      ...acquis.traites.motifs,
      ...plan.motifs.aCreer.map((motif) => motif.id),
      ...plan.motifs.aMettreAJour.map((motif) => motif.id),
      ...plan.motifs.inchanges.map((motif) => motif.id),
    ]),
    lieux: new Set([
      ...acquis.traites.lieux,
      ...plan.lieux.aCreer.map((lieu) => lieu.id),
      ...plan.lieux.aMettreAJour.map((lieu) => lieu.id),
      ...plan.lieux.inchanges.map((lieu) => lieu.id),
    ]),
    usagers: new Set([
      ...acquis.traites.usagers,
      ...plan.usagers.aCreer.map((usager) => usager.id),
      ...plan.usagers.aMettreAJour.map((usager) => usager.id),
      ...plan.usagers.inchanges.map((usager) => usager.id),
    ]),
  },
  lots: [...acquis.lots, plan],
  rapprochements: [...acquis.rapprochements, rapprochement],
})

/**
 * Réconcilie les rendez-vous d'un compte avec ce que RDV Service Public renvoie.
 *
 * Le travail se fait par lots : l'état connu n'est lu que pour les rendez-vous du
 * lot en cours, et la mémoire des modèles déjà écrits évite de repasser sur un
 * motif ou un usager partagé avec un lot précédent.
 *
 * Rien n'est écrit avant que la liste complète soit reçue : la suppression des
 * rendez-vous disparus se décide sur l'ensemble, et une réponse partielle en
 * effacerait à tort.
 */
export const synchroniserRdvs =
  ({
    listerRdvs,
    rdvsDejaImportes,
    etatConnuDuLot,
    appliquerPlan,
    supprimerRdvs,
    supprimerMotifsOrphelins,
    lireLesUsagersARapprocher,
    rapprocherLesBeneficiaires,
  }: SynchroniserRdvsPorts) =>
  async ({
    compte,
    organisationIds: porteeDemandee,
    mediateurId,
    tailleLot,
  }: {
    readonly compte: CompteRdvUtilisable
    readonly organisationIds?: readonly OrganisationId[]
    readonly mediateurId: string
    readonly tailleLot: number
  }): Promise<Result<RdvsSynchronises, EchecDeSynchroniserRdvs>> => {
    const lus = await lireRdvs(listerRdvs, compte, porteeDemandee)

    if (!lus.success) {
      return lus
    }

    const { organisationIdsInaccessibles } = lus.data
    const organisationIds = organisationsAccessibles(
      porteeDemandee,
      organisationIdsInaccessibles,
    )
    const portee = organisationIds === undefined ? {} : { organisationIds }

    const dejaImportes = await rdvsDejaImportes({ compte, ...portee })

    if (!dejaImportes.success) {
      return dejaImportes
    }

    const recus = lus.data.rdvs
    const rdvsRecus = recus.map(({ rdv }) => rdv)
    const bruts = new Map<RdvId, unknown>(
      recus.map(({ rdv, brut }: RdvSynchronise) => [rdv.id, brut]),
    )

    const cumul = await decouper(recus, tailleLot).reduce<
      Promise<Result<Cumul, EchecDeSynchroniserRdvs>>
    >(
      async (precedent, lot) => {
        const acquis = await precedent

        if (!acquis.success) {
          return acquis
        }

        const rdvsDuLot = lot.map(({ rdv }) => rdv)

        const connu = await etatConnuDuLot({
          rdvIds: rdvsDuLot.map((rdv) => rdv.id),
          ...portee,
        })

        if (!connu.success) {
          return connu
        }

        const plan = planifierLot({
          recus: rdvsDuLot,
          connu: connu.data,
          dejaTraites: acquis.data.traites,
        })

        const application = await appliquerPlan({ compte, plan, bruts })

        if (!application.success) {
          return application
        }

        const rapprochement = await rapprocherLesUsagers(
          { lireLesUsagersARapprocher, rapprocherLesBeneficiaires },
          {
            usagerIds: [
              ...plan.usagers.aCreer,
              ...plan.usagers.aMettreAJour,
            ].map((usager) => usager.id),
            mediateurId,
          },
        )

        return success(cumuler(acquis.data, plan, rapprochement))
      },
      Promise.resolve(success(cumulVide)),
    )

    if (!cumul.success) {
      return cumul
    }

    const rdvsSupprimes = rdvsASupprimer({
      enBase: dejaImportes.data,
      recus: rdvsRecus,
    })

    const suppression = await supprimerRdvs(rdvsSupprimes)

    if (!suppression.success) {
      return suppression
    }

    const motifsOrphelinsDans = organisationIds ?? compte.organisationIds
    const motifsSupprimes = await supprimerMotifsOrphelins(motifsOrphelinsDans)

    if (!motifsSupprimes.success) {
      return motifsSupprimes
    }

    const { traites } = cumul.data

    return success({
      rdvs: {
        ...cumul.data.rdvs,
        deleted: rdvsSupprimes.length,
        count: rdvsRecus.length,
      },
      usagers: { ...cumul.data.usagers, count: traites.usagers.size },
      motifs: {
        ...cumul.data.motifs,
        deleted: motifsSupprimes.data,
        count: traites.motifs.size,
      },
      lieux: { ...cumul.data.lieux, count: traites.lieux.size },
      organisationIdsInaccessibles,
      lots: cumul.data.lots,
      rapprochements: cumul.data.rapprochements,
      rdvsSupprimes,
      motifsOrphelinsDans,
    })
  }
