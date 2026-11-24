import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { getUserDepartement } from '@/libraries/departement/get-user-departement'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import {
  ExportStatistiques,
  ExportStatistiquesEnAttente,
} from '../../../../ui/components/ExportStatistiques'
import { ImpressionPreteProvider } from '../../../../ui/components/impression-prete'
import { BlocEnAttente } from '../../../../ui/components/sections/BlocEnAttente'
import { titreDesStatistiques } from '../../../../ui/presenters/titre-des-statistiques.presenter'
import { StatistiquesImpact } from '../components/StatistiquesImpact'

export const MesStatistiquesPage = ({
  barreDeFiltres,
  filtres,
  user,
  hasCrasV1,
  accompagnementsCount,
  partage,
  impression,
  generale,
  activites,
  beneficiaires,
}: {
  barreDeFiltres: (actions: ReactNode) => ReactNode
  filtres: { readonly libelles: readonly string[]; readonly requete: string }
  user: {
    readonly coordinateur: { readonly id: string } | null
    readonly mediateur: { readonly id: string } | null
    readonly emplois: readonly {
      readonly structure: { readonly codeInsee: string | null }
    }[]
  }
  hasCrasV1: boolean
  accompagnementsCount: Promise<number>
  partage: ReactNode
  impression: ReactNode
  generale: ReactNode
  activites: ReactNode
  beneficiaires: ReactNode
}) => {
  return (
    <ImpressionPreteProvider key={filtres.requete}>
      <CoopPageContainer size={56}>
        <CoopBreadcrumbs currentPage={titreDesStatistiques(user)} />
        <SkipLinksPortal />
        {impression}
        <main className="fr-no-print" id={contentId}>
          <h1 className="fr-text-title--blue-france fr-mb-5v">
            {titreDesStatistiques(user)}
          </h1>
          {barreDeFiltres(
            <div className="fr-flex fr-flex-gap-2v">
              {partage}
              <BlocEnAttente attente={<ExportStatistiquesEnAttente />}>
                <ExportStatistiques
                  libelles={filtres.libelles}
                  requete={filtres.requete}
                  accompagnementsCount={accompagnementsCount}
                />
              </BlocEnAttente>
            </div>,
          )}
          {hasCrasV1 && (
            <Notice
              className="fr-notice--flex fr-align-items-center fr-mt-6v"
              title={
                <span className="fr-text--xs fr-text--regular fr-text-default--grey">
                  Les activités renseignées dans l’Espace Coop (V1) sont
                  maintenant visibles sur cette page statistique.{' '}
                  <Link
                    target="_blank"
                    rel="noreferrer"
                    href="https://docs.numerique.gouv.fr/docs/e2e794bb-30b3-41ea-a24f-4ef5c8ec074c"
                    className="fr-link fr-text--xs"
                  >
                    En savoir plus
                  </Link>
                </span>
              }
            />
          )}
          <section className="fr-mb-6w fr-mt-6v">{generale}</section>
          <section className="fr-mb-6w">{activites}</section>
          <section className="fr-mb-6w">{beneficiaires}</section>
          <section className="fr-mb-6w">
            <StatistiquesImpact
              codeDepartement={getUserDepartement(user)?.code}
            />
          </section>
        </main>
      </CoopPageContainer>
    </ImpressionPreteProvider>
  )
}
