import { createOrMergeBeneficiairesFromRdvUserIds } from '../../../../implementation/beneficiaire/creer-ou-fusionner-beneficiaires.adapter'
import type { RapprocherBeneficiaires } from '../../domain/synchroniser-rdvs'

export type DependancesRapprochement = {
  readonly mediateurId: string
  readonly journaliser?: (message: string) => void
}

/**
 * Rapproche les bénéficiaires des usagers qui viennent d'être importés.
 *
 * L'échec est absorbé ici, et nulle part ailleurs : un usager à la donnée
 * inexploitable ne doit jamais empêcher les rendez-vous d'être à jour. C'est la
 * règle que portait déjà l'ancien code, conservée telle quelle.
 */
export const rapprocherBeneficiaires =
  ({
    mediateurId,
    journaliser = () => {
      // Journal facultatif : la synchronisation par job en fournit un, pas les tests.
    },
  }: DependancesRapprochement): RapprocherBeneficiaires =>
  async ({ usagerIds }) => {
    if (usagerIds.length === 0) {
      return
    }

    const { skipped } = await createOrMergeBeneficiairesFromRdvUserIds({
      rdvUsers: usagerIds.map((id) => ({ id })),
      mediateurId,
    }).catch((erreur) => {
      journaliser(
        `merge bénéficiaires échoué (non bloquant): ${
          erreur instanceof Error ? erreur.message : String(erreur)
        }`,
      )
      return { merges: [], skipped: [] }
    })

    if (skipped.length > 0) {
      journaliser(`merge bénéficiaires: ${skipped.length} usager(s) écarté(s)`)
    }
  }
