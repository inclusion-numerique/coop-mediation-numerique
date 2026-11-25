import type { CreerOuFusionnerDepuisUsagersExternes } from '../../../domain/ports'
import type { CreerOuFusionnerBeneficiaires } from './creer-activite-depuis-rdv'
import type { BeneficiaireFusionne } from './rdv-pour-activite'

/**
 * Adaptateur vers la feature bénéficiaire, appelée par son API publique et non
 * par son domaine (AR-3). Le vocabulaire change de côté : un usager RDV Service
 * Public devient un « usager externe », que la feature bénéficiaire rapproche de
 * ses fiches selon ses propres règles de dédoublonnage.
 */
export const creerOuFusionnerBeneficiaires =
  (
    creerOuFusionner: CreerOuFusionnerDepuisUsagersExternes<BeneficiaireFusionne>,
  ): CreerOuFusionnerBeneficiaires =>
  async ({ usagers, mediateurId }) => {
    const { merges } = await creerOuFusionner({
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
    })

    return merges
  }
