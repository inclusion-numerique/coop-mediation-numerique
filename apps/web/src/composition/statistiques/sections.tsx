import {
  ChiffresClesDesAccompagnements,
  ChiffresClesImprimes,
} from '@app/web/features/activites/abilities/compter-les-accompagnements/ui'
import { CommunesDesAccompagnements } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-commune/ui'
import {
  LieuxDesAccompagnements,
  LieuxImprimes,
} from '@app/web/features/activites/abilities/compter-les-accompagnements-par-lieu/ui'
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
import {
  CanauxDesAccompagnements,
  CanauxImprimes,
  DemarchesDesAccompagnements,
  DureesDesAccompagnements,
  DureesImprimees,
  MaterielsImprimes,
  MaterielsUtilises,
  ThematiquesDesAccompagnements,
  TypesDActivite,
  TypesDActiviteImprimes,
} from '@app/web/features/activites/abilities/repartir-les-accompagnements/ui'
import { TagsDesAccompagnements } from '@app/web/features/activites/abilities/repartir-les-accompagnements-par-tag/ui'
import type { StatistiquesFournies } from '@app/web/features/activites/ui/statistiques/statistiques-fournies'
import { ImpressionDesStatistiques } from '@app/web/features/statistiques/ui/pages/ImpressionDesStatistiques'
import { SectionActivites } from '@app/web/features/statistiques/ui/sections/SectionActivites'
import { SectionActivitesImprimee } from '@app/web/features/statistiques/ui/sections/SectionActivitesImprimee'
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

type DonneesDesActivites = Pick<
  StatistiquesFournies,
  'activites' | 'totalCounts'
> &
  Partial<Pick<StatistiquesFournies, 'structures' | 'communes'>>

export const sectionActivites = (
  { activites, totalCounts, structures, communes }: DonneesDesActivites,
  {
    wording,
    canManageTags,
  }: { wording?: Wording; canManageTags?: boolean } = {},
) => (
  <SectionActivites
    wording={wording}
    canManageTags={canManageTags}
    types={
      <TypesDActivite
        typeActivites={activites.typeActivites}
        ateliers={totalCounts.activites.collectifs.total}
      />
    }
    thematiques={
      <ThematiquesDesAccompagnements thematiques={activites.thematiques} />
    }
    demarches={
      <DemarchesDesAccompagnements
        thematiquesDemarches={activites.thematiquesDemarches}
      />
    }
    tags={<TagsDesAccompagnements tags={activites.tags} />}
    materiels={<MaterielsUtilises materiels={activites.materiels} />}
    canaux={<CanauxDesAccompagnements typeLieu={activites.typeLieu} />}
    durees={<DureesDesAccompagnements durees={activites.durees} />}
    lieux={
      structures === undefined ? undefined : (
        <LieuxDesAccompagnements structures={structures} />
      )
    }
    communes={
      communes === undefined ? undefined : (
        <CommunesDesAccompagnements communes={communes} />
      )
    }
  />
)

export const sectionActivitesImprimee = ({
  activites,
  totalCounts,
  structures,
}: Pick<StatistiquesFournies, 'activites' | 'totalCounts' | 'structures'>) => (
  <SectionActivitesImprimee
    types={
      <TypesDActiviteImprimes
        typeActivites={activites.typeActivites}
        participations={totalCounts.accompagnements.collectifs.total}
      />
    }
    thematiques={
      <ThematiquesDesAccompagnements
        thematiques={activites.thematiques}
        pourImpression
      />
    }
    demarches={
      <DemarchesDesAccompagnements
        thematiquesDemarches={activites.thematiquesDemarches}
        pourImpression
      />
    }
    tags={<TagsDesAccompagnements tags={activites.tags} pourImpression />}
    materiels={<MaterielsImprimes materiels={activites.materiels} />}
    canaux={<CanauxImprimes typeLieu={activites.typeLieu} />}
    durees={<DureesImprimees durees={activites.durees} />}
    lieux={<LieuxImprimes structures={structures} />}
  />
)

export const impressionDesStatistiques = (
  statistiques: StatistiquesFournies &
    Omit<
      Parameters<typeof ImpressionDesStatistiques>[0],
      'generale' | 'activites' | 'beneficiaires'
    >,
) => (
  <ImpressionDesStatistiques
    {...statistiques}
    generale={sectionGeneraleImprimee(statistiques)}
    activites={sectionActivitesImprimee(statistiques)}
    beneficiaires={sectionBeneficiairesImprimee(statistiques)}
  />
)
