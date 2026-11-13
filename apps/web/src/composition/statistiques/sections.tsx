import type {
  StatistiquesEnCours,
  StatistiquesFournies,
} from '@app/web/composition/statistiques/statistiques-fournies'
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
  GraphiqueEnAttente,
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
import { AutoPrint } from '@app/web/features/statistiques/ui/pages/AutoPrint'
import { ImpressionDesStatistiques } from '@app/web/features/statistiques/ui/pages/ImpressionDesStatistiques'
import { BlocEnAttente } from '@app/web/features/statistiques/ui/sections/BlocEnAttente'
import { SectionActivites } from '@app/web/features/statistiques/ui/sections/SectionActivites'
import { SectionActivitesImprimee } from '@app/web/features/statistiques/ui/sections/SectionActivitesImprimee'
import { SectionBeneficiaires } from '@app/web/features/statistiques/ui/sections/SectionBeneficiaires'
import { SectionBeneficiairesImprimee } from '@app/web/features/statistiques/ui/sections/SectionBeneficiairesImprimee'
import { SectionGenerale } from '@app/web/features/statistiques/ui/sections/SectionGenerale'
import { SectionGeneraleImprimee } from '@app/web/features/statistiques/ui/sections/SectionGeneraleImprimee'
import type { ReactNode } from 'react'

type Wording = 'personnel' | 'generique'

type Donnee<T> = T | Promise<T>

type EnCours<K extends keyof StatistiquesEnCours> = Awaited<
  StatistiquesEnCours[K]
>

const Attendue = async <T,>({
  donnee,
  rendu,
}: {
  donnee: Promise<T>
  rendu: (valeur: T) => ReactNode
}) => rendu(await donnee)

const bloc = <T,>(
  donnee: Donnee<T>,
  rendu: (valeur: T) => ReactNode,
  className?: string,
  attente?: ReactNode,
): ReactNode =>
  donnee instanceof Promise ? (
    <BlocEnAttente className={className} attente={attente}>
      <Attendue donnee={donnee} rendu={rendu} />
    </BlocEnAttente>
  ) : (
    rendu(donnee)
  )

export const sectionGenerale = (
  {
    totalCounts,
    periode,
  }: {
    totalCounts: Donnee<EnCours<'totalCounts'>>
    periode: Donnee<EnCours<'periode'>>
  },
  { wording, debut, fin }: { wording?: Wording; debut?: string; fin?: string },
) => (
  <SectionGenerale
    wording={wording}
    chiffresCles={bloc(
      totalCounts,
      (totaux) => (
        <ChiffresClesDesAccompagnements
          totalCounts={totaux}
          debut={debut}
          fin={fin}
        />
      ),
      'fr-col-xl-4 fr-col-12',
    )}
    graphique={bloc(
      periode,
      ({ accompagnementsParJour, accompagnementsParMois }) => (
        <GraphiqueDesAccompagnements
          accompagnementsParJour={accompagnementsParJour}
          accompagnementsParMois={accompagnementsParMois}
        />
      ),
      'fr-col',
      <GraphiqueEnAttente />,
    )}
  />
)

export const sectionGeneraleImprimee = ({
  totalCounts,
  accompagnementsParJour,
  accompagnementsParMois,
}: Pick<
  StatistiquesFournies,
  'totalCounts' | 'accompagnementsParJour' | 'accompagnementsParMois'
>) => (
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

export const sectionBeneficiaires = (
  {
    profil,
    residences,
  }: {
    profil: Donnee<EnCours<'profil'>>
    residences?: Donnee<EnCours<'residences'>>
  },
  { wording }: { wording?: Wording } = {},
) => (
  <SectionBeneficiaires
    wording={wording}
    profil={bloc(profil, (beneficiaires) => (
      <ProfilDesPersonnesAccompagnees beneficiaires={beneficiaires} />
    ))}
    communes={
      residences === undefined
        ? undefined
        : bloc(residences, (communes) => (
            <CommunesDeResidence communes={communes} />
          ))
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

export const sectionActivites = (
  {
    totalCounts,
    repartition,
    tags,
    structures,
    communes,
  }: {
    totalCounts: Donnee<EnCours<'totalCounts'>>
    repartition: Donnee<EnCours<'repartition'>>
    tags: Donnee<EnCours<'tags'>>
    structures?: Donnee<EnCours<'structures'>>
    communes?: Donnee<EnCours<'communes'>>
  },
  {
    wording,
    canManageTags,
  }: { wording?: Wording; canManageTags?: boolean } = {},
) => (
  <SectionActivites
    wording={wording}
    canManageTags={canManageTags}
    types={bloc(
      totalCounts instanceof Promise || repartition instanceof Promise
        ? Promise.all([totalCounts, repartition])
        : ([totalCounts, repartition] as const),
      ([totaux, activites]) => (
        <TypesDActivite
          typeActivites={activites.typeActivites}
          ateliers={totaux.activites.collectifs.total}
        />
      ),
      'fr-col',
    )}
    thematiques={bloc(repartition, (activites) => (
      <ThematiquesDesAccompagnements thematiques={activites.thematiques} />
    ))}
    demarches={bloc(repartition, (activites) => (
      <DemarchesDesAccompagnements
        thematiquesDemarches={activites.thematiquesDemarches}
      />
    ))}
    tags={bloc(tags, (parTag) => <TagsDesAccompagnements tags={parTag} />)}
    materiels={bloc(repartition, (activites) => (
      <MaterielsUtilises materiels={activites.materiels} />
    ))}
    canauxEtDurees={bloc(
      repartition,
      (activites) => (
        <>
          <CanauxDesAccompagnements typeLieu={activites.typeLieu} />
          <DureesDesAccompagnements durees={activites.durees} />
        </>
      ),
      'fr-flex-grow-1',
    )}
    lieux={
      structures === undefined
        ? undefined
        : bloc(structures, (parLieu) => (
            <LieuxDesAccompagnements structures={parLieu} />
          ))
    }
    communes={
      communes === undefined
        ? undefined
        : bloc(communes, (parCommune) => (
            <CommunesDesAccompagnements communes={parCommune} />
          ))
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

export const impressionDesStatistiques = ({
  statistiques,
  ...options
}: {
  statistiques: Donnee<StatistiquesFournies>
} & Omit<
  Parameters<typeof ImpressionDesStatistiques>[0],
  'generale' | 'activites' | 'beneficiaires'
>) =>
  bloc(statistiques, (fournies) => (
    <>
      <ImpressionDesStatistiques
        {...options}
        generale={sectionGeneraleImprimee(fournies)}
        activites={sectionActivitesImprimee(fournies)}
        beneficiaires={sectionBeneficiairesImprimee(fournies)}
      />
      <AutoPrint />
    </>
  ))
