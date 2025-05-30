import { type ParticipantsAnonymesCraCollectifData } from '@app/web/features/activites/use-cases/cra/collectif/validation/ParticipantsAnonymesCraCollectifValidation'
import { participantsAnonymesDefault } from '@app/web/features/activites/use-cases/cra/collectif/validation/participantsAnonymes'
import { Beneficiaire } from '@prisma/client'

export const createParticipantsAnonymesForBeneficiaires = <
  T extends Pick<
    Beneficiaire,
    'anonyme' | 'statutSocial' | 'genre' | 'trancheAge'
  > & { premierAccompagnement: boolean },
>(
  beneficiaires: T[],
): {
  participantsAnonymes: ParticipantsAnonymesCraCollectifData
  beneficiairesSuivis: T[]
} => {
  const participantsAnonymes = { ...participantsAnonymesDefault }
  const beneficiairesSuivis: T[] = []

  for (const beneficiaire of beneficiaires) {
    if (beneficiaire.anonyme) {
      // Increment total number of anonymous participants
      participantsAnonymes.total += 1

      participantsAnonymes.dejaAccompagne += beneficiaire.premierAccompagnement
        ? 0
        : 1

      // Increment the corresponding counters for genre, statut social, and tranche d'âge
      participantsAnonymes[`genre${beneficiaire.genre ?? 'NonCommunique'}`] += 1
      participantsAnonymes[
        `statutSocial${beneficiaire.statutSocial ?? 'NonCommunique'}`
      ] += 1
      participantsAnonymes[
        `trancheAge${beneficiaire.trancheAge ?? 'NonCommunique'}`
      ] += 1
      continue
    }

    // Add to beneficiairesSuivis if the beneficiary is not anonymous
    beneficiairesSuivis.push(beneficiaire)
  }

  return {
    participantsAnonymes,
    beneficiairesSuivis,
  }
}
