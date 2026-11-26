import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../domain/lieu'
import { appliquerModification } from './appliquer-la-modification'
import {
  type EchecDeModifierLaFicheDuLieu,
  FicheIntrouvable,
  PublicationSansAdresse,
  PublicationSansService,
} from './errors'
import type { ModificationLieu } from './modification-lieu'
import type { ModifierLaFicheDuLieuPorts } from './ports'
import { laisseUnePublicationSansAdresse } from './publication-sans-adresse'
import { laisseUnePublicationSansService } from './publication-sans-service'

const verifierLaPublication = (
  id: LieuId,
  modifie: Lieu,
  modification: ModificationLieu,
): Result<Lieu, EchecDeModifierLaFicheDuLieu> => {
  if (laisseUnePublicationSansService(modifie, modification))
    return failure(PublicationSansService(id))

  if (laisseUnePublicationSansAdresse(modifie, modification))
    return failure(PublicationSansAdresse(id))

  return success(modifie)
}

export const modifierLaFicheDuLieu =
  ({ consulter, enregistrer }: ModifierLaFicheDuLieuPorts) =>
  async ({
    id,
    modification,
    par,
    maintenant,
  }: {
    readonly id: LieuId
    readonly modification: ModificationLieu
    readonly par: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<Lieu, EchecDeModifierLaFicheDuLieu>> => {
    const fiche = await consulter(id)

    if (fiche == null) return failure(FicheIntrouvable(id))

    const verifie = verifierLaPublication(
      id,
      appliquerModification(fiche.lieu, modification, par, maintenant),
      modification,
    )

    if (!verifie.success) return verifie

    await enregistrer({
      lieu: verifie.data,
      sections: [modification.section],
      maintenant,
    })

    return verifie
  }
