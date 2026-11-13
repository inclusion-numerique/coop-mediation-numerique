import {
  ChiffresClesDesAccompagnements,
  ChiffresClesImprimes,
} from '@app/web/features/activites/abilities/compter-les-accompagnements/ui'
import {
  GraphiqueDesAccompagnements,
  GraphiquesImprimes,
} from '@app/web/features/activites/abilities/compter-les-accompagnements-par-periode/ui'
import {
  CommunesDeResidence,
  CommunesDeResidenceImprimees,
} from '@app/web/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui'
import {
  ProfilDesPersonnesAccompagnees,
  ProfilImprime,
} from '@app/web/features/activites/abilities/decrire-les-personnes-accompagnees/ui'
import type { StatistiquesFournies } from '@app/web/features/activites/ui/statistiques/statistiques-fournies'
import { SectionBeneficiaires } from '@app/web/features/statistiques/ui/sections/SectionBeneficiaires'
import { SectionBeneficiairesImprimee } from '@app/web/features/statistiques/ui/sections/SectionBeneficiairesImprimee'
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

type DonneesDesBeneficiaires = {
  beneficiaires:
    | StatistiquesFournies['beneficiaires']
    | Omit<StatistiquesFournies['beneficiaires'], 'communes'>
}

export const sectionBeneficiaires = (
  { beneficiaires }: DonneesDesBeneficiaires,
  { wording }: { wording?: Wording } = {},
) => (
  <SectionBeneficiaires
    wording={wording}
    profil={<ProfilDesPersonnesAccompagnees beneficiaires={beneficiaires} />}
    communes={
      'communes' in beneficiaires ? (
        <CommunesDeResidence communes={beneficiaires.communes} />
      ) : undefined
    }
  />
)

export const sectionBeneficiairesImprimee = ({
  beneficiaires,
}: Pick<StatistiquesFournies, 'beneficiaires'>) => (
  <SectionBeneficiairesImprimee
    profil={<ProfilImprime beneficiaires={beneficiaires} />}
    communes={
      <CommunesDeResidenceImprimees
        communes={beneficiaires.communes}
        total={beneficiaires.total}
      />
    }
  />
)
