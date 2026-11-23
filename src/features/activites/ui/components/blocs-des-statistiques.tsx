import type { ReactNode } from 'react'
import type {
  StatistiquesEnCours,
  StatistiquesFournies,
} from '@/features/activites/implementations/statistiques'
import { ChiffresClesDesAccompagnements } from '../../abilities/compter-les-accompagnements/ui/components/ChiffresClesDesAccompagnements'
import { ChiffresClesImprimes } from '../../abilities/compter-les-accompagnements/ui/components/ChiffresClesImprimes'
import { CommunesDesAccompagnements } from '../../abilities/compter-les-accompagnements-par-commune/ui/components/CommunesDesAccompagnements'
import { LieuxDesAccompagnements } from '../../abilities/compter-les-accompagnements-par-lieu/ui/components/LieuxDesAccompagnements'
import { LieuxImprimes } from '../../abilities/compter-les-accompagnements-par-lieu/ui/components/LieuxImprimes'
import { GraphiqueDesAccompagnements } from '../../abilities/compter-les-accompagnements-par-periode/ui/components/GraphiqueDesAccompagnements'
import { GraphiqueEnAttente } from '../../abilities/compter-les-accompagnements-par-periode/ui/components/GraphiqueEnAttente'
import { GraphiquesImprimes } from '../../abilities/compter-les-accompagnements-par-periode/ui/components/GraphiquesImprimes'
import { CommunesDeResidence } from '../../abilities/compter-les-personnes-accompagnees-par-commune/ui/components/CommunesDeResidence'
import { CommunesDeResidenceImprimees } from '../../abilities/compter-les-personnes-accompagnees-par-commune/ui/components/CommunesDeResidenceImprimees'
import { ProfilDesPersonnesAccompagnees } from '../../abilities/decrire-les-personnes-accompagnees/ui/components/ProfilDesPersonnesAccompagnees'
import { ProfilImprime } from '../../abilities/decrire-les-personnes-accompagnees/ui/components/ProfilImprime'
import { CanauxDesAccompagnements } from '../../abilities/repartir-les-accompagnements/ui/components/CanauxDesAccompagnements'
import { CanauxImprimes } from '../../abilities/repartir-les-accompagnements/ui/components/CanauxImprimes'
import { DemarchesDesAccompagnements } from '../../abilities/repartir-les-accompagnements/ui/components/DemarchesDesAccompagnements'
import { DureesDesAccompagnements } from '../../abilities/repartir-les-accompagnements/ui/components/DureesDesAccompagnements'
import { DureesImprimees } from '../../abilities/repartir-les-accompagnements/ui/components/DureesImprimees'
import { MaterielsImprimes } from '../../abilities/repartir-les-accompagnements/ui/components/MaterielsImprimes'
import { MaterielsUtilises } from '../../abilities/repartir-les-accompagnements/ui/components/MaterielsUtilises'
import { ThematiquesDesAccompagnements } from '../../abilities/repartir-les-accompagnements/ui/components/ThematiquesDesAccompagnements'
import { TypesDActivite } from '../../abilities/repartir-les-accompagnements/ui/components/TypesDActivite'
import { TypesDActiviteImprimes } from '../../abilities/repartir-les-accompagnements/ui/components/TypesDActiviteImprimes'
import { TagsDesAccompagnements } from '../../abilities/repartir-les-accompagnements-par-tag/ui/components/TagsDesAccompagnements'

type Donnee<T> = T | Promise<T>

type EnCours<K extends keyof StatistiquesEnCours> = Awaited<
  StatistiquesEnCours[K]
>

type Bloc<T> = {
  readonly donnee: Donnee<T>
  rendu(valeur: T): ReactNode
  readonly className?: string
  readonly attente?: ReactNode
}

const bloc = <T,>(
  donnee: Donnee<T>,
  rendu: (valeur: T) => ReactNode,
  className?: string,
  attente?: ReactNode,
): Bloc<T> => ({ donnee, rendu, className, attente })

export const blocsGeneraux = (
  {
    totalCounts,
    periode,
  }: {
    totalCounts: Donnee<EnCours<'totalCounts'>>
    periode: Donnee<EnCours<'periode'>>
  },
  { debut, fin }: { debut?: string; fin?: string } = {},
) => ({
  chiffresCles: bloc(
    totalCounts,
    (totaux) => (
      <ChiffresClesDesAccompagnements
        totalCounts={totaux}
        debut={debut}
        fin={fin}
      />
    ),
    'fr-col-xl-4 fr-col-12',
  ),
  graphique: bloc(
    periode,
    ({ accompagnementsParJour, accompagnementsParMois }) => (
      <GraphiqueDesAccompagnements
        accompagnementsParJour={accompagnementsParJour}
        accompagnementsParMois={accompagnementsParMois}
      />
    ),
    'fr-col',
    <GraphiqueEnAttente />,
  ),
})

export const blocsBeneficiaires = ({
  profil,
  residences,
}: {
  profil: Donnee<EnCours<'profil'>>
  residences?: Donnee<EnCours<'residences'>>
}) => ({
  profil: bloc(profil, (beneficiaires) => (
    <ProfilDesPersonnesAccompagnees beneficiaires={beneficiaires} />
  )),
  communes:
    residences === undefined
      ? undefined
      : bloc(residences, (communes) => (
          <CommunesDeResidence communes={communes} />
        )),
})

export const blocsActivites = ({
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
}) => ({
  types: bloc(
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
  ),
  thematiques: bloc(repartition, (activites) => (
    <ThematiquesDesAccompagnements thematiques={activites.thematiques} />
  )),
  demarches: bloc(repartition, (activites) => (
    <DemarchesDesAccompagnements
      thematiquesDemarches={activites.thematiquesDemarches}
    />
  )),
  tags: bloc(tags, (parTag) => <TagsDesAccompagnements tags={parTag} />),
  materiels: bloc(repartition, (activites) => (
    <MaterielsUtilises materiels={activites.materiels} />
  )),
  canauxEtDurees: bloc(
    repartition,
    (activites) => (
      <>
        <CanauxDesAccompagnements typeLieu={activites.typeLieu} />
        <DureesDesAccompagnements durees={activites.durees} />
      </>
    ),
    'fr-flex-grow-1',
  ),
  lieux:
    structures === undefined
      ? undefined
      : bloc(structures, (parLieu) => (
          <LieuxDesAccompagnements structures={parLieu} />
        )),
  communes:
    communes === undefined
      ? undefined
      : bloc(communes, (parCommune) => (
          <CommunesDesAccompagnements communes={parCommune} />
        )),
})

export const blocsImprimes = ({
  totalCounts,
  accompagnementsParJour,
  accompagnementsParMois,
  beneficiaires,
  activites,
  structures,
}: StatistiquesFournies) => ({
  generale: {
    chiffresCles: <ChiffresClesImprimes totalCounts={totalCounts} />,
    graphiques: (
      <GraphiquesImprimes
        accompagnementsParJour={accompagnementsParJour}
        accompagnementsParMois={accompagnementsParMois}
      />
    ),
  },
  beneficiaires: {
    profil: <ProfilImprime beneficiaires={beneficiaires} />,
    communes: (
      <CommunesDeResidenceImprimees
        communes={beneficiaires.communes}
        total={beneficiaires.total}
      />
    ),
  },
  activites: {
    types: (
      <TypesDActiviteImprimes
        typeActivites={activites.typeActivites}
        participations={totalCounts.accompagnements.collectifs.total}
      />
    ),
    thematiques: (
      <ThematiquesDesAccompagnements
        thematiques={activites.thematiques}
        pourImpression
      />
    ),
    demarches: (
      <DemarchesDesAccompagnements
        thematiquesDemarches={activites.thematiquesDemarches}
        pourImpression
      />
    ),
    tags: <TagsDesAccompagnements tags={activites.tags} pourImpression />,
    materiels: <MaterielsImprimes materiels={activites.materiels} />,
    canaux: <CanauxImprimes typeLieu={activites.typeLieu} />,
    durees: <DureesImprimees durees={activites.durees} />,
    lieux: <LieuxImprimes structures={structures} />,
  },
})
