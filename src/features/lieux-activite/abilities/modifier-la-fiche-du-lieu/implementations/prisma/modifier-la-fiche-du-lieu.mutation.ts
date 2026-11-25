import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { UtilisateurId } from '../../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../../domain/lieu'
import { appliquerModification } from '../../domain/appliquer-la-modification'
import {
  type EchecDeModification,
  FicheIntrouvable,
  PublicationSansAdresse,
  PublicationSansService,
} from '../../domain/errors'
import type { ModificationLieu } from '../../domain/modification-lieu'
import { laisseUnePublicationSansAdresse } from '../../domain/publication-sans-adresse'
import { laisseUnePublicationSansService } from '../../domain/publication-sans-service'
import { consulterLaFicheDuLieu } from './consulter-la-fiche-du-lieu.query'
import { enregistrerLesSections } from './enregistrer-les-sections.mutation'

export const modifierLaFicheDuLieu = async ({
  id,
  modification,
  par,
  maintenant = new Date(),
}: {
  id: LieuId
  modification: ModificationLieu
  par: UtilisateurId
  maintenant?: Date
}): Promise<Result<Lieu, EchecDeModification>> => {
  const fiche = await consulterLaFicheDuLieu(id)

  if (fiche == null) return failure(FicheIntrouvable(id))

  const modifie = appliquerModification(
    fiche.lieu,
    modification,
    par,
    maintenant,
  )

  if (laisseUnePublicationSansService(modifie, modification))
    return failure(PublicationSansService(id))

  if (laisseUnePublicationSansAdresse(modifie, modification))
    return failure(PublicationSansAdresse(id))

  await enregistrerLesSections({
    lieu: modifie,
    sections: [modification.section],
    maintenant,
  })

  return success(modifie)
}
