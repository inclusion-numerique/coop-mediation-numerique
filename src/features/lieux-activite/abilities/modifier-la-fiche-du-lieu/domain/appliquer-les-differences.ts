import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../domain/lieu'
import {
  type ChoixDesDifferences,
  differences,
  sectionsConcernees,
} from './differences'
import { type EchecDeModification, FicheIntrouvable } from './errors'
import type { ModifierLaFicheDuLieuPorts } from './ports'
import { resoudreLesDifferences } from './resoudre-les-differences'

export const appliquerLesDifferences =
  ({ consulter, enregistrer }: ModifierLaFicheDuLieuPorts) =>
  async ({
    id,
    choix,
    par,
    maintenant,
  }: {
    readonly id: LieuId
    readonly choix: ChoixDesDifferences
    readonly par: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<Lieu, EchecDeModification>> => {
    const fiche = await consulter(id)

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

    await enregistrer({
      lieu: modifie,
      sections: sectionsConcernees(ecarts),
      maintenant,
    })

    return success(modifie)
  }
