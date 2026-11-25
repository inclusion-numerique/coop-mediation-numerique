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
import type {
  EtatConnu,
  PlanLot,
} from '@/features/rdvsp/abilities/synchroniser-rdvs/domain/plan-rdvs'
import {
  type DejaTraites,
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
import type { Rdv, RdvSynchronise } from '@/features/rdvsp/domain/rdv/rdv'
import { type Result, success } from '@/libraries/result'

type BilanSynchronisationRdvs = {
  readonly rdvs: BilanModele & { readonly count: number }
  readonly usagers: BilanModele & { readonly count: number }
  readonly motifs: BilanModele & { readonly count: number }
  readonly lieux: BilanModele & { readonly count: number }
}

export type PortéeSynchronisation = {
  readonly compte: CompteRdvUtilisable
  /**
   * Restreint la synchronisation à ces organisations. Une liste vide ne
   * signifie pas « toutes » mais « aucune » — le cas des comptes dont aucun
   * webhook n'a échoué.
   */
  readonly organisationIds?: readonly OrganisationId[]
}

type RdvsSynchronises = BilanSynchronisationRdvs & {
  readonly organisationIdsInaccessibles: readonly OrganisationId[]
}

export type SynchroniserRdvs = (
  portee: PortéeSynchronisation,
) => Promise<Result<RdvsSynchronises, ErreurRdvApi>>

/** Identifiants des rendez-vous déjà détenus, dans le périmètre synchronisé. */
export type RdvsDejaImportes = (
  portee: PortéeSynchronisation,
) => Promise<readonly RdvId[]>

export type EtatConnuDuLot = (input: {
  readonly rdvIds: readonly RdvId[]
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<EtatConnu>

export type AppliquerPlanLot = (input: {
  readonly compte: CompteRdvUtilisable
  readonly plan: PlanLot
  /**
   * Trace d'origine de chaque rendez-vous, indexée par identifiant. Elle voyage
   * hors du plan : le domaine n'a rien à faire d'un payload, seule l'écriture le
   * conserve.
   */
  readonly bruts: ReadonlyMap<RdvId, unknown>
}) => Promise<void>

/**
 * Retire les motifs qu'aucun rendez-vous ne référence plus, dans les seules
 * organisations que la passe a parcourues.
 *
 * Les motifs arrivent portés par les rendez-vous : rien ne les énumère
 * indépendamment, et un motif absent du lot n'est donc pas nécessairement
 * supprimé chez RDV Service Public — il peut n'avoir aucun rendez-vous dans la
 * fenêtre. Seule l'absence de toute référence est un critère sûr, et elle se
 * répare d'elle-même : le prochain rendez-vous qui porte ce motif le recrée.
 *
 * La liste est **exigée**, et jamais facultative. Une portée absente signifiait
 * « pas de filtre », donc un balayage de toute la table : la passe d'un compte
 * ramassait les motifs de tous les autres, imputait la suppression à son propre
 * bilan, et pouvait effacer un motif qu'une passe concurrente venait de créer
 * mais dont le rendez-vous n'était pas encore écrit — la clé étrangère faisait
 * alors échouer cette passe-là. Le type interdit désormais ce cas.
 */
export type SupprimerMotifsOrphelins = (
  organisationIds: readonly OrganisationId[],
) => Promise<number>

export type SupprimerRdvs = (rdvIds: readonly RdvId[]) => Promise<void>

/**
 * Rapproche les bénéficiaires des usagers importés. L'échec est absorbé par
 * l'implémentation : une donnée d'usager inexploitable ne doit jamais empêcher
 * les rendez-vous d'être à jour.
 */
export type RapprocherBeneficiaires = (input: {
  readonly usagerIds: readonly number[]
}) => Promise<void>

export type DependancesSynchroniserRdvs = {
  readonly listerRdvs: RdvServicePublicApi['listerRdvs']
  readonly rdvsDejaImportes: RdvsDejaImportes
  readonly etatConnuDuLot: EtatConnuDuLot
  readonly appliquerPlan: AppliquerPlanLot
  readonly supprimerRdvs: SupprimerRdvs
  readonly supprimerMotifsOrphelins: SupprimerMotifsOrphelins
  readonly rapprocherBeneficiaires: RapprocherBeneficiaires
  readonly tailleLot?: number
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
}

const cumulVide: Cumul = {
  rdvs: bilanVide,
  usagers: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
  traites: { motifs: new Set(), lieux: new Set(), usagers: new Set() },
}

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
    rapprocherBeneficiaires,
    tailleLot = 250,
  }: DependancesSynchroniserRdvs): SynchroniserRdvs =>
  async (portee) => {
    const { compte } = portee

    const lus = await lireRdvs(listerRdvs, compte, portee.organisationIds)

    if (!lus.success) {
      return lus
    }

    const { organisationIdsInaccessibles } = lus.data
    const organisationIds = organisationsAccessibles(
      portee.organisationIds,
      organisationIdsInaccessibles,
    )
    const dejaImportes = await rdvsDejaImportes({
      compte,
      ...(organisationIds === undefined ? {} : { organisationIds }),
    })
    const recus = lus.data.rdvs

    const rdvsRecus = recus.map(({ rdv }) => rdv)
    const bruts = new Map<RdvId, unknown>(
      recus.map(({ rdv, brut }: RdvSynchronise) => [rdv.id, brut]),
    )

    const cumul = await decouper(recus, tailleLot).reduce(
      async (precedent, lot) => {
        const acquis = await precedent
        const rdvsDuLot: Rdv[] = lot.map(({ rdv }) => rdv)

        const connu = await etatConnuDuLot({
          rdvIds: rdvsDuLot.map((rdv) => rdv.id),
          ...(organisationIds === undefined ? {} : { organisationIds }),
        })

        const plan = planifierLot({
          recus: rdvsDuLot,
          connu,
          dejaTraites: acquis.traites,
        })

        await appliquerPlan({ compte, plan, bruts })

        // Découplé de la réconciliation des rendez-vous : un rapprochement de
        // bénéficiaire en échec ne doit jamais empêcher la mise à jour des
        // rendez-vous eux-mêmes.
        await rapprocherBeneficiaires({
          usagerIds: [...plan.usagers.aCreer, ...plan.usagers.aMettreAJour].map(
            (usager) => usager.id,
          ),
        })

        return {
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
        }
      },
      Promise.resolve(cumulVide),
    )

    const aSupprimer = rdvsASupprimer({
      enBase: dejaImportes,
      recus: rdvsRecus,
    })

    await supprimerRdvs(aSupprimer)

    // Après la suppression des rendez-vous, jamais avant : ce sont eux qui
    // libèrent les motifs devenus orphelins.
    //
    // À défaut de portée explicite, la passe est complète pour *ce compte* — pas
    // pour la base. Ses organisations bornent donc le ramassage.
    const motifsSupprimes = await supprimerMotifsOrphelins(
      organisationIds ?? compte.organisationIds,
    )

    return success({
      ...bilanFinal(
        cumul,
        rdvsRecus.length,
        aSupprimer.length,
        motifsSupprimes,
      ),
      organisationIdsInaccessibles,
    })
  }

const bilanFinal = (
  cumul: Cumul,
  recus: number,
  supprimes: number,
  motifsSupprimes: number,
): BilanSynchronisationRdvs => ({
  rdvs: { ...cumul.rdvs, deleted: supprimes, count: recus },
  usagers: { ...cumul.usagers, count: cumul.traites.usagers.size },
  motifs: {
    ...cumul.motifs,
    deleted: motifsSupprimes,
    count: cumul.traites.motifs.size,
  },
  lieux: { ...cumul.lieux, count: cumul.traites.lieux.size },
})
