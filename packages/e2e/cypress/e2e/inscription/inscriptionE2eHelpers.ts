/* eslint unicorn/prevent-abbreviations: 0 */

import { CreateUserInput } from '@app/e2e/tasks/handlers/user.tasks'
import {
  allProfileInscriptionLabels,
  lowerCaseProfileInscriptionLabels,
  profileInscriptionSlugs,
} from '@app/web/inscription/profilInscription'
import { appUrl } from '@app/e2e/support/helpers'
import { inscriptionRolesErrorTitles } from '@app/web/app/inscription/(steps)/identification/_components/inscriptionRole'

export const startInscriptionAs = ({
  user,
  profilInscription,
  identificationResult,
  expectedCheckedProfilInscription,
}: {
  user?: CreateUserInput
  profilInscription: keyof typeof allProfileInscriptionLabels
  identificationResult: 'matching' | 'different' | 'not-found'
  expectedCheckedProfilInscription?: keyof typeof allProfileInscriptionLabels
}) => {
  if (user != null) cy.createUserAndSignin(user)

  cy.visit(appUrl('/inscription'))

  cy.contains(
    new RegExp(`^${allProfileInscriptionLabels[profilInscription]}$`),
  ).click()
  cy.contains('J’ai lu et j’accepte').click()

  cy.get('button').contains('Continuer').click()

  cy.appUrlShouldBe(`/inscription/identification`, { timeout: 15_000 })

  if (identificationResult === 'matching') {
    if (
      profilInscription === 'Mediateur' ||
      profilInscription === 'Coordinateur'
    ) {
      cy.contains('Finaliser votre inscription pour accéder à votre espace', {
        timeout: 15_000,
      })
    } else {
      cy.contains(
        `Vous avez été identifié en tant que ${lowerCaseProfileInscriptionLabels[profilInscription]}`,
        { timeout: 15_000 },
      )
    }
    cy.findByRole('link', { name: 'Continuer' })
  } else if (identificationResult === 'different') {
    cy.contains('Finaliser votre inscription pour accéder à votre espace')
    if (!expectedCheckedProfilInscription) {
      throw new Error(
        'Expected checked profil inscription not provided in cy test : "expectedCheckedProfilInscription" needed',
      )
    }
    cy.contains(
      `Profil de ${allProfileInscriptionLabels[expectedCheckedProfilInscription].toLocaleLowerCase()} identifié`,
    )
    cy.findByRole('link', { name: 'Continuer mon inscription' })
  } else {
    cy.contains(
      inscriptionRolesErrorTitles[profileInscriptionSlugs[profilInscription]],
    )
    cy.findByRole('button', { name: 'Essayer une autre adresse email' })
  }
}
