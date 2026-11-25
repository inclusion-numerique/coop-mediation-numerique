import Notice from '@codegouvfr/react-dsfr/Notice'
import type { ReactNode } from 'react'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
import type { CompteDeTest } from '../../domain'
import { BoutonUsurper } from '../components/BoutonUsurper'
import { UsurpationLibre } from '../components/UsurpationLibre'

export const UsurpationPage = ({
  comptesDeTest,
  usurpationLibre,
  enProduction,
  reinitialiser,
}: {
  comptesDeTest: readonly CompteDeTest[]
  usurpationLibre: boolean
  enProduction: boolean
  reinitialiser: (utilisateurId: string) => ReactNode
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs currentPage="Usurpation" />
    <main id={contentId}>
      <AdministrationTitle icon="ri-spy-line">
        Usurpation d’utilisateurs de test
      </AdministrationTitle>
      <p>
        Sur les instances de preview, vous pouvez vous connecter en tant
        qu’utilisateur de test (fixture) pour tester différent parcours.
      </p>
      {usurpationLibre && <UsurpationLibre />}
      {enProduction ? (
        <Notice title="Cette fonctionnalité n’est pas disponible en production. Vous pouvez tester cette fonctionnalité en local ou sur une autre instance de l’application" />
      ) : (
        <div className="fr-table" data-fr-js-table="true">
          <div className="fr-table__wrapper">
            <div className="fr-table__container">
              <div className="fr-table__content">
                <table data-fr-js-table-element="true">
                  <thead>
                    <tr>
                      <th scope="col">Utilisateur</th>
                      <th scope="col" colSpan={2} />
                    </tr>
                  </thead>
                  <tbody>
                    {comptesDeTest.map(({ id, nom }) => (
                      <tr key={id}>
                        <th>{nom}</th>
                        <td>
                          <BoutonUsurper taille="small" utilisateurId={id} />
                        </td>
                        <td>{reinitialiser(id)}</td>
                      </tr>
                    ))}
                    {comptesDeTest.length === 0 && (
                      <tr>
                        <td colSpan={4}>
                          Aucun utilisateur de test n’a été chargé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  </CoopPageContainer>
)
