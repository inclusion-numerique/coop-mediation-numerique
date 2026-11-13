import {
  ChiffresClesDesAccompagnements,
  ChiffresClesImprimes,
} from '@app/web/features/activites/abilities/compter-les-accompagnements/ui'
import {
  GraphiqueDesAccompagnements,
  GraphiquesImprimes,
} from '@app/web/features/activites/abilities/compter-les-accompagnements-par-periode/ui'
import type { StatistiquesFournies } from '@app/web/features/activites/ui/statistiques/statistiques-fournies'
import { SectionGenerale } from '@app/web/features/statistiques/ui/sections/SectionGenerale'
import { SectionGeneraleImprimee } from '@app/web/features/statistiques/ui/sections/SectionGeneraleImprimee'

type Wording = 'personnel' | 'generique'

type DonneesGenerales = Pick<
  StatistiquesFournies,
  'totalCounts' | 'accompagnementsParJour' | 'accompagnementsParMois'
>

export const sectionGenerale = (
  {
    totalCounts,
    accompagnementsParJour,
    accompagnementsParMois,
  }: DonneesGenerales,
  { wording, debut, fin }: { wording?: Wording; debut?: string; fin?: string },
) => (
  <SectionGenerale
    wording={wording}
    chiffresCles={
      <ChiffresClesDesAccompagnements
        totalCounts={totalCounts}
        debut={debut}
        fin={fin}
      />
    }
    graphique={
      <GraphiqueDesAccompagnements
        accompagnementsParJour={accompagnementsParJour}
        accompagnementsParMois={accompagnementsParMois}
      />
    }
  />
)

export const sectionGeneraleImprimee = ({
  totalCounts,
  accompagnementsParJour,
  accompagnementsParMois,
}: DonneesGenerales) => (
  <SectionGeneraleImprimee
    chiffresCles={<ChiffresClesImprimes totalCounts={totalCounts} />}
    graphiques={
      <GraphiquesImprimes
        accompagnementsParJour={accompagnementsParJour}
        accompagnementsParMois={accompagnementsParMois}
      />
    }
  />
)
