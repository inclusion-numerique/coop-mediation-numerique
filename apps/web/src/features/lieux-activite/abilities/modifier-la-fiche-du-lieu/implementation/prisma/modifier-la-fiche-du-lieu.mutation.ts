import { failure, type Result, success } from '@app/web/libraries/result'
import type { Lieu } from '../../../../domain/lieu'
import type { LieuId } from '../../../../domain/lieu-id'
import type { UserId } from '../../../../domain/user-id'
import { appliquerModification } from '../../domain/appliquer-la-modification'
import {
  type EchecDeModification,
  FicheIntrouvable,
  PublicationSansService,
} from '../../domain/errors'
import type { ModificationLieu } from '../../domain/modification-lieu'
import { laisseUnePublicationSansService } from '../../domain/publication-sans-service'
import { consulterLaFicheDuLieu } from './consulter-la-fiche-du-lieu.query'
import { enregistrerLesSections } from './enregistrer-les-sections'

export const modifierLaFicheDuLieu = async ({
  id,
  modification,
  par,
  maintenant = new Date(),
}: {
  id: LieuId
  modification: ModificationLieu
  par: UserId
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

  await enregistrerLesSections({
    lieu: modifie,
    sections: [modification.section],
    maintenant,
  })

  return success(modifie)
}
