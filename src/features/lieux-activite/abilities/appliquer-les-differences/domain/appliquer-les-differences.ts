import { failure, type Result, success } from '@/libraries/result'
import {
  type ChoixDesDifferences,
  differences,
  sectionsConcernees,
} from '../../../domain/differences'
import { FicheIntrouvable } from '../../../domain/errors'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { SectionsEnregistrees } from '../../../domain/sections-enregistrees'
import type { DifferencesAppliquees } from './differences-appliquees'
import type { EchecDAppliquerLesDifferences } from './errors'
import type { AppliquerLesDifferencesPorts } from './ports'
import { resoudreLesDifferences } from './resoudre-les-differences'

export const appliquerLesDifferences =
  ({ consulter, enregistrer }: AppliquerLesDifferencesPorts) =>
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
  }): Promise<Result<DifferencesAppliquees, EchecDAppliquerLesDifferences>> => {
    const fiche = await consulter(id)

    if (fiche == null) return failure(FicheIntrouvable(id))

    const ecarts = differences(fiche.ficheCoop, fiche.lieu.fiche)

    if (ecarts.length === 0)
      return success({ _tag: 'SansEcart', lieu: fiche.lieu })

    const appliquees: SectionsEnregistrees = {
      _tag: 'Enregistree',
      lieu: resoudreLesDifferences({
        lieu: fiche.lieu,
        ficheCoop: fiche.ficheCoop,
        ecarts,
        choix,
        par,
        maintenant,
      }),
      sections: sectionsConcernees(ecarts),
    }

    await enregistrer({
      lieu: appliquees.lieu,
      sections: appliquees.sections,
      maintenant,
    })

    return success(appliquees)
  }
