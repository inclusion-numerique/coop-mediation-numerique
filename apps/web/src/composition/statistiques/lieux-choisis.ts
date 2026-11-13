import {
  LieuActiviteId,
  nommerLesLieuxChoisis,
} from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques'
import { optionsDesLieuxChoisis } from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui'
import type { LieuxChoisisDeLaBarre } from '@app/web/features/statistiques/ui/filtres/lieux-choisis'
import type { ActivitesFilters } from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import { CodeDepartement, CodeInsee } from '@app/web/libraries/insee'

const valides =
  <T>(lire: (valeur: string) => T | null) =>
  (valeurs: readonly string[] | undefined): T[] =>
    (valeurs ?? []).flatMap((valeur) => {
      const lue = lire(valeur)
      return lue === null ? [] : [lue]
    })

export const lieuxChoisisDe = async ({
  lieux,
  communes,
  departements,
}: Pick<
  ActivitesFilters,
  'lieux' | 'communes' | 'departements'
>): Promise<LieuxChoisisDeLaBarre> =>
  optionsDesLieuxChoisis(
    await nommerLesLieuxChoisis({
      lieux: valides(LieuActiviteId.safe)(lieux),
      communes: valides(CodeInsee.safe)(communes),
      departements: valides(CodeDepartement.safe)(departements),
    }),
  )
