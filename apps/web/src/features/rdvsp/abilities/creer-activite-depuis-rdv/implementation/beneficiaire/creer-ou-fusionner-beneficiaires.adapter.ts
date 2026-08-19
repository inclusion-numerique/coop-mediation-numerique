import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from '@app/web/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe'
import type { CreerOuFusionnerBeneficiaires } from '../../domain/creer-activite-depuis-rdv'

/**
 * Adaptateur vers la feature bénéficiaire, appelée par son API publique et non
 * par son domaine (AR-3). Le vocabulaire change de côté : un usager RDV Service
 * Public devient un « usager externe », que la feature bénéficiaire rapproche de
 * ses fiches selon ses propres règles de dédoublonnage.
 */
export const creerOuFusionnerBeneficiaires: CreerOuFusionnerBeneficiaires =
  async ({ usagers, mediateurId }) => {
    const { merges } = await creerOuFusionnerBeneficiairesDepuisUsagersExternes(
      {
        usagers: usagers.map((usager) => ({
          rdvUserId: usager.id,
          prenom: usager.prenom,
          nom: usager.nom,
          email: usager.email,
          telephone: usager.telephone,
          adresse: usager.adresse,
          birthDate: usager.dateNaissance,
        })),
        mediateurId,
      },
    )

    return merges
  }
