import {
  LieuActiviteId,
  nommerLesLieuxChoisis,
} from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques'
import { optionsDesLieuxChoisis } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui'
import type { PerimetreDesStatistiques } from '@/features/activites/domain'
import type { LieuxChoisisDeLaBarre } from '@/features/statistiques/ui/filtres/lieux-choisis'
import type { ActivitesFilters } from '@/features/statistiques/ui/filtres/parametres-de-la-barre'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'

const valides =
  <T>(lire: (valeur: string) => T | null) =>
  (valeurs: readonly string[] | undefined): T[] =>
    (valeurs ?? []).flatMap((valeur) => {
      const lue = lire(valeur)
      return lue === null ? [] : [lue]
    })

export const lieuxChoisisDe = async (
  {
    lieux,
    communes,
    departements,
  }: Pick<ActivitesFilters, 'lieux' | 'communes' | 'departements'>,
  perimetre: PerimetreDesStatistiques,
): Promise<LieuxChoisisDeLaBarre> =>
  optionsDesLieuxChoisis(
    await nommerLesLieuxChoisis(
      {
        lieux: valides(LieuActiviteId.safe)(lieux),
        communes: valides(CodeInsee.safe)(communes),
        departements: valides(CodeDepartement.safe)(departements),
      },
      perimetre,
    ),
  )
