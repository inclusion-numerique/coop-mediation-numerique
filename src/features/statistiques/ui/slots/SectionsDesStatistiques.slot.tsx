import type { ReactNode } from 'react'
import { ImpressionAutomatique } from '../components/ImpressionAutomatique'
import { ImpressionDesStatistiques } from '../components/ImpressionDesStatistiques'
import { ImpressionPrete } from '../components/ImpressionPrete'
import { BlocEnAttente } from '../components/sections/BlocEnAttente'
import { SectionActivites } from '../components/sections/SectionActivites'
import { SectionActivitesImprimee } from '../components/sections/SectionActivitesImprimee'
import { SectionBeneficiaires } from '../components/sections/SectionBeneficiaires'
import { SectionBeneficiairesImprimee } from '../components/sections/SectionBeneficiairesImprimee'
import { SectionGenerale } from '../components/sections/SectionGenerale'
import { SectionGeneraleImprimee } from '../components/sections/SectionGeneraleImprimee'

type Wording = 'personnel' | 'generique'

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

const enBloc = (bloc: ReactNode, className?: string): ReactNode =>
  bloc === null ? null : (
    <BlocEnAttente className={className}>{bloc}</BlocEnAttente>
  )

export const sectionGenerale = (
  {
    chiffresCles,
    graphique,
  }: { chiffresCles: ReactNode; graphique: ReactNode },
  { wording }: { wording?: Wording | undefined } = {},
) => (
  <SectionGenerale
    wording={wording}
    chiffresCles={enBloc(chiffresCles, 'fr-col-xl-4 fr-col-12')}
    graphique={enBloc(graphique, 'fr-col')}
  />
)

export const sectionBeneficiaires = (
  { profil, communes }: { profil: ReactNode; communes: ReactNode },
  { wording }: { wording?: Wording | undefined } = {},
) => (
  <SectionBeneficiaires
    wording={wording}
    profil={enBloc(profil)}
    communes={enBloc(communes) ?? undefined}
  />
)

export const sectionActivites = (
  blocs: {
    types: ReactNode
    thematiques: ReactNode
    demarches: ReactNode
    tags: ReactNode
    materiels: ReactNode
    canauxEtDurees: ReactNode
    lieux: ReactNode
    communes: ReactNode
  },
  {
    wording,
    canManageTags,
  }: {
    wording?: Wording | undefined
    canManageTags?: boolean | undefined
  } = {},
) => (
  <SectionActivites
    wording={wording}
    canManageTags={canManageTags}
    types={enBloc(blocs.types, 'fr-col')}
    thematiques={enBloc(blocs.thematiques)}
    demarches={enBloc(blocs.demarches)}
    tags={enBloc(blocs.tags)}
    materiels={enBloc(blocs.materiels)}
    canauxEtDurees={enBloc(blocs.canauxEtDurees, 'fr-flex-grow-1')}
    lieux={enBloc(blocs.lieux) ?? undefined}
    communes={enBloc(blocs.communes) ?? undefined}
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
          <ImpressionAutomatique />
          <ImpressionPrete />
        </>
      )
    },
    'fr-print',
    false,
  )
