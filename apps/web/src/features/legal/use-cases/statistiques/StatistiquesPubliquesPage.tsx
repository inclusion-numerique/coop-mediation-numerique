import Breadcrumbs from '@app/web/components/Breadcrumbs'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import React from 'react'
import { Accompagnements } from './components/page-sections/Accompagnements'
import { Beneficiaires } from './components/page-sections/Beneficiaires'
import { ChiffresCles } from './components/page-sections/ChiffresCles'
import { Impact } from './components/page-sections/Impact'
import { UtilisateursActifs } from './components/page-sections/UtilisateursActifs'
import { getStatistiquesPubliquesPageData } from './getStatistiquesPubliquesPageData'

const StatistiquesPubliquesPage = async () => {
  const {
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs,
  } = await getStatistiquesPubliquesPageData()

  return (
    <div className="fr-container">
      <SkipLinksPortal />
      <Breadcrumbs currentPage="Statistiques" />
      <main id={contentId} className="fr-mt-12v fr-mb-30v">
        <h1 className="fr-text-title--blue-france fr-mb-2v">
          Statistiques d’impact de la plateforme
        </h1>
        <p className="fr-text--xl">
          Cette page statistique a pour objectif de suivre l’évolution de
          l’usage de La Coop de la médiation numérique et de démontrer l’impact
          du produit grâce à différents indicateurs.
        </p>
        <div className="fr-border-radius--16 fr-title-blue--france fr-background-alt--yellow-tournesol fr-p-12v fr-my-12v">
          <div className="fr-flex fr-align-items-center fr-flex-gap-4v">
            <img
              src="/images/services/conseillers-numerique-logo.svg"
              alt="Logo Conseillers numériques"
            />
            <h2 className="fr-h6 fr-mb-0 fr-flex-grow-1 fr-text-title--blue-france">
              Message important&nbsp;!
              <br />
              Cette page statistique n’a pas vocation à représenter l’impact du
              dispositif Conseiller numérique.
            </h2>
          </div>
          <p className="fr-mt-8v">
            La Coop de la médiation numérique a été mis en ligne le{' '}
            <strong>15.11.2024</strong>, venant en remplacement de l’
            <strong>espace Coop des conseillers numériques</strong>. Cette
            nouvelle plateforme s’adresse cette fois-ci à l’ensemble des
            médiateurs numériques afin d’offrir un socle commun d’outillage
            pérenne et harmonisé au niveau national. Les données visibles sur
            cette page sont donc comptabilisés depuis le 15.11.2024 et intègrent
            des données sur le nombre d’accompagnements réalisés par des
            conseillers numériques mais également des médiateurs numériques hors
            du dispositif.{' '}
            <strong>
              Cette page statistique n’est donc pas représentative des
              accompagnements réalisés par les conseillers numériques depuis le
              début du dispositif
            </strong>
            .
          </p>
          <p className="fr-mt-8v fr-mb-0">
            Pour suivre le nombre d’accompagnements réalisés par les conseillers
            numériques depuis le début du dispositif, visitez cette page&nbsp;:
            <br />
            <a
              className="fr-link"
              href="https://www.info.gouv.fr/politiques-prioritaires/batir-de-nouveaux-progres-et-refonder-nos-services-publics/conseillers-numeriques-un-accompagnement-gratuit-a-la-maitrise-du-numerique-du-quotidien?geolevel=NAT&geocode=FRANCE#widget-viz-IND-736"
              target="_blank"
            >
              Voir les statistiques nationales du dispositif Conseillers
              numériques
            </a>
          </p>
        </div>
        <section className="fr-my-12v">
          <ChiffresCles {...chiffresCles} />
          <Accompagnements accompagnements={accompagnements} />
        </section>
        <hr className="fr-separator-12v" />
        <section>
          <Impact />
        </section>
        <hr className="fr-separator-12v" />
        <section>
          <Beneficiaires
            beneficiaires={beneficiaires}
            {...suiviBeneficiaires}
          />
        </section>
        <hr className="fr-separator-12v" />
        <section>
          <UtilisateursActifs utilisateursActifs={utilisateursActifs} />
        </section>
      </main>
    </div>
  )
}

export default StatistiquesPubliquesPage
