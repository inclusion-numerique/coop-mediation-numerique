import { createOrMergeBeneficiairesFromRdvUserIds } from '../../../../sync/createOrMergeBeneficiaireFromRdvUsers'
import type { RapprocherBeneficiairesDuRdv } from '../../domain/recevoir-webhook-rdv'

/**
 * Rapproche les bénéficiaires des participants du rendez-vous notifié.
 *
 * L'échec est absorbé ici : un usager à la donnée inexploitable ne doit pas
 * empêcher la réconciliation du rendez-vous lui-même — c'est précisément le
 * symptôme qui avait laissé des rendez-vous honorés affichés « passé ».
 */
export const rapprocherBeneficiairesDuRdv =
  (
    journaliser: (message: string) => void = () => {
      // Journal facultatif : la route en fournit un, pas les tests.
    },
  ): RapprocherBeneficiairesDuRdv =>
  async ({ rdv, mediateurId }) => {
    const usagerIds = rdv.participations.map(
      (participation) => participation.usagerId,
    )

    if (usagerIds.length === 0) {
      return
    }

    await createOrMergeBeneficiairesFromRdvUserIds({
      rdvUsers: usagerIds.map((id) => ({ id })),
      mediateurId,
    }).catch((erreur) => {
      journaliser(
        `merge bénéficiaires échoué (non bloquant) pour le rendez-vous ${rdv.id} : ${
          erreur instanceof Error ? erreur.message : String(erreur)
        }`,
      )
      return { merges: [], skipped: [] }
    })
  }
