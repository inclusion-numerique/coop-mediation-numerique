import type { ReactNode } from 'react'
import { ImpressionDesStatistiques } from './ImpressionDesStatistiques'
import { AutoPrint } from './impression-automatique'
import { ImpressionPrete } from './impression-prete'
import { BlocEnAttente } from './sections/BlocEnAttente'
import { SectionActivites } from './sections/SectionActivites'
import { SectionActivitesImprimee } from './sections/SectionActivitesImprimee'
import { SectionBeneficiaires } from './sections/SectionBeneficiaires'
import { SectionBeneficiairesImprimee } from './sections/SectionBeneficiairesImprimee'
import { SectionGenerale } from './sections/SectionGenerale'
import { SectionGeneraleImprimee } from './sections/SectionGeneraleImprimee'

type Wording = 'personnel' | 'generique'

type Bloc = {
  readonly donnee: unknown
  rendu(valeur: unknown): ReactNode
  readonly className?: string
  readonly attente?: ReactNode
}

const Attendue = async <T,>({
  donnee,
  rendu,
}: {
  donnee: Promise<T>
  rendu: (valeur: T) => ReactNode
}) => rendu(await donnee)

const enAttente = <T,>(
  donnee: T | Promise<T>,
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

const enBloc = (bloc: Bloc): ReactNode =>
  enAttente(
    bloc.donnee,
    (valeur) => bloc.rendu(valeur),
    bloc.className,
    bloc.attente,
  )

const enBlocOptionnel = (bloc: Bloc | undefined): ReactNode =>
  bloc === undefined ? undefined : enBloc(bloc)

export const sectionGenerale = (
  { chiffresCles, graphique }: { chiffresCles: Bloc; graphique: Bloc },
  { wording }: { wording?: Wording } = {},
) => (
  <SectionGenerale
    wording={wording}
    chiffresCles={enBloc(chiffresCles)}
    graphique={enBloc(graphique)}
  />
)

export const sectionBeneficiaires = (
  { profil, communes }: { profil: Bloc; communes?: Bloc },
  { wording }: { wording?: Wording } = {},
) => (
  <SectionBeneficiaires
    wording={wording}
    profil={enBloc(profil)}
    communes={enBlocOptionnel(communes)}
  />
)

export const sectionActivites = (
  blocs: {
    types: Bloc
    thematiques: Bloc
    demarches: Bloc
    tags: Bloc
    materiels: Bloc
    canauxEtDurees: Bloc
    lieux?: Bloc
    communes?: Bloc
  },
  {
    wording,
    canManageTags,
  }: { wording?: Wording; canManageTags?: boolean } = {},
) => (
  <SectionActivites
    wording={wording}
    canManageTags={canManageTags}
    types={enBloc(blocs.types)}
    thematiques={enBloc(blocs.thematiques)}
    demarches={enBloc(blocs.demarches)}
    tags={enBloc(blocs.tags)}
    materiels={enBloc(blocs.materiels)}
    canauxEtDurees={enBloc(blocs.canauxEtDurees)}
    lieux={enBlocOptionnel(blocs.lieux)}
    communes={enBlocOptionnel(blocs.communes)}
  />
)

type SectionsImprimees = {
  readonly generale: Parameters<typeof SectionGeneraleImprimee>[0]
  readonly activites: Parameters<typeof SectionActivitesImprimee>[0]
  readonly beneficiaires: Parameters<typeof SectionBeneficiairesImprimee>[0]
}

export const impressionDesStatistiques = <Statistiques,>({
  statistiques,
  imprimees,
  ...options
}: {
  statistiques: Statistiques | Promise<Statistiques>
  imprimees: (statistiques: Statistiques) => SectionsImprimees
} & Omit<
  Parameters<typeof ImpressionDesStatistiques>[0],
  'generale' | 'activites' | 'beneficiaires'
>) =>
  enAttente(
    statistiques,
    (fournies) => {
      const { generale, activites, beneficiaires } = imprimees(fournies)
      return (
        <>
          <ImpressionDesStatistiques
            {...options}
            generale={<SectionGeneraleImprimee {...generale} />}
            activites={<SectionActivitesImprimee {...activites} />}
            beneficiaires={<SectionBeneficiairesImprimee {...beneficiaires} />}
          />
          <AutoPrint />
          <ImpressionPrete />
        </>
      )
    },
    'fr-print',
    false,
  )
