import { nommerLesLieuxChoisis } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma/lieux-choisis.query'
import { optionsDesLieuxChoisis } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux.presenter'
import type { PerimetreDesStatistiques } from '@/features/activites/domain'
import { LieuActiviteId } from '@/features/activites/domain'
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
  }: {
    readonly lieux?: readonly string[]
    readonly communes?: readonly string[]
    readonly departements?: readonly string[]
  },
  perimetre: PerimetreDesStatistiques,
) =>
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
