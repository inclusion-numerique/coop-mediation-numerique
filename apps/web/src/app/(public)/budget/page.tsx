/* eslint jsx-a11y/control-has-associated-label: 0  */
import type { Metadata } from 'next'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import Breadcrumbs from '@app/web/components/Breadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'

export const metadata: Metadata = {
  title: metadataTitle('Budget'),
}

const BudgetPage = () => (
  <div className="fr-container">
    <SkipLinksPortal links={defaultSkipLinks} />
    <Breadcrumbs currentPage="Budget" />
    <main
      id={contentId}
      className="fr-container landing-main-container fr-my-8w"
    >
      <h1>
        Budget de La coop de la médiation numérique -{' '}
        {process.env.NEXT_PUBLIC_APP_NAME}
      </h1>
      <p>
        La coop de la médiation numérique est un service public numérique
        développé au sein de l’Incubateur des territoires de l’Agence Nationale
        de la Cohésion des Territoires (ANCT). C’est la raison pour laquelle
        nous sommes transparents sur les ressources allouées et la manière dont
        elles sont employées.
      </p>

      <h2>Fonctionnement</h2>

      <p>
        La coop de la médiation numérique est une stat-up d’Etat : l’équipe est
        donc portée par une intrapreneuse agent public qui est responsable du
        service numérique développé au sein de son administration (ANCT en
        l’occurence).
      </p>
      <p>
        Le budget exposé ici ne prend pas en compte l’intrapreneuse puisqu’elle
        est salariée (fonctionnaire) de l’ANCT mais concerne le reste de
        l’équipe qui est constitué de free lance sur les volets Produit, Design,
        Développement et Déploiement.
      </p>
      <p>
        Membres de l’équipe : - Manon Galle, Intrapreneuse - Thibault Rouveyrol,
        Responsable de produit - Hugues Maignol, Développeur - Sylvain Aubry,
        Designer - Alexandre Martinez, Chargé de déploiement/support - Sarah
        Ouali, Chargée de déploiement/support
      </p>
      <p>
        L’ensemble des membres de l’équipe ne sont pas à temps plein sur le
        développement de La coop de la médiation mais développe, en parallèle,
        d’autres produits numériques pour l’ANCT.
      </p>

      <h2>Budget</h2>

      <p>
        La coop de la médiation numérique est un service en construction ayant
        démarré son développement en février 2024.
      </p>
      <div className="fr-table" data-fr-js-table="true">
        <table className="data-table" data-fr-js-table-element="true">
          <thead>
            <tr>
              <th className="fr-background-alt--blue-france" scope="col">
                Poste de dépense
              </th>
              <th className="fr-background-alt--blue-france" scope="col">
                Dépenses 2024
              </th>
              <th className="fr-background-alt--blue-france" scope="col">
                Dépenses prévisionnelles T1 2025
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Produit</th>
              <td>140 465 €</td>
              <td>36 290 €</td>
            </tr>
            <tr>
              <th>Design</th>
              <td>172 698 €</td>
              <td>31 104 €</td>
            </tr>
            <tr>
              <th>Développement</th>
              <td> 199 758 €</td>
              <td>93 792 €</td>
            </tr>
            <tr>
              <th>Déploiement/support</th>
              <td>10 166 €</td>
              <td>18 774 €</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="fr-col-md-10 fr-background-alt--blue-france fr-p-6w fr-border-radius--16">
        <h4>A propos de la TVA</h4>
        <p>
          Contrairement aux entreprises du secteur privé, les administrations ne
          peuvent pas récupérer la TVA supportée sur leurs achats dans le cadre
          de leur activité. Le montant TTC inclut la TVA au taux de 20%. La TVA
          est collectée et reservée à l’Etat et diminue donc le montant du
          budget utilisable sur le projet.
        </p>
      </div>
    </main>
  </div>
)
export default BudgetPage
