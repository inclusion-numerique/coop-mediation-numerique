import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { UtilisateurId } from '../../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../../domain/lieu'
import {
  type ChoixDesDifferences,
  differences,
  sectionsConcernees,
} from '../../domain/differences'
import { type EchecDeModification, FicheIntrouvable } from '../../domain/errors'
import { resoudreLesDifferences } from '../../domain/resoudre-les-differences'
import { consulterLaFicheDuLieu } from './consulter-la-fiche-du-lieu.query'
import { enregistrerLesSections } from './enregistrer-les-sections.mutation'

export const appliquerLesDifferences = async ({
  id,
  choix,
  par,
  maintenant = new Date(),
}: {
  id: LieuId
  choix: ChoixDesDifferences
  par: UtilisateurId
  maintenant?: Date
}): Promise<Result<Lieu, EchecDeModification>> => {
  const fiche = await consulterLaFicheDuLieu(id)

  if (fiche == null) return failure(FicheIntrouvable(id))

  const ecarts = differences(fiche.ficheCoop, fiche.lieu.fiche)

  if (ecarts.length === 0) return success(fiche.lieu)

  const modifie = resoudreLesDifferences({
    lieu: fiche.lieu,
    ficheCoop: fiche.ficheCoop,
    ecarts,
    choix,
    par,
    maintenant,
  })

  await enregistrerLesSections({
    lieu: modifie,
    sections: sectionsConcernees(ecarts),
    maintenant,
  })

  return success(modifie)
}
