import { success } from '@app/web/libraries/result'
import type { Rdv, RdvSynchronise } from '../../../domain/rdv'
import type { RdvId } from '../../../domain/rdv-id'
import type { RdvServicePublicApi } from '../../../domain/rdv-service-public.port'
import {
  type BilanModele,
  bilanDuPlan,
  bilanVide,
  cumulerBilans,
} from '../domain/plan-modele'
import {
  type DejaTraites,
  planifierLot,
  rdvsASupprimer,
} from '../domain/plan-rdvs'
import type {
  AppliquerPlanLot,
  BilanSynchronisationRdvs,
  EtatConnuDuLot,
  RapprocherBeneficiaires,
  RdvsDejaImportes,
  SupprimerMotifsOrphelins,
  SupprimerRdvs,
  SynchroniserRdvs,
} from '../domain/synchroniser-rdvs'

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
    const { compte, organisationIds } = portee

    const [dejaImportes, recus] = await Promise.all([
      rdvsDejaImportes(portee),
      listerRdvs(compte, {
        agentId: compte.agentId,
        organisationIds,
        debutApres: compte.synchroniserDepuis ?? undefined,
      }),
    ])

    if (!recus.success) {
      return recus
    }

    const rdvsRecus = recus.data.map(({ rdv }) => rdv)
    const bruts = new Map<RdvId, unknown>(
      recus.data.map(({ rdv, brut }: RdvSynchronise) => [rdv.id, brut]),
    )

    const cumul = await decouper(recus.data, tailleLot).reduce(
      async (precedent, lot) => {
        const acquis = await precedent
        const rdvsDuLot: Rdv[] = lot.map(({ rdv }) => rdv)

        const connu = await etatConnuDuLot({
          rdvIds: rdvsDuLot.map((rdv) => rdv.id),
          organisationIds,
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

    return success(
      bilanFinal(cumul, rdvsRecus.length, aSupprimer.length, motifsSupprimes),
    )
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
