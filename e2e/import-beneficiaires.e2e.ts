import { appUrl } from '@e2e/support/helpers'
import { mediateurSansActivites } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites'

describe('ETQ Utilisateur, je peux importer des bénéficiaires', () => {
  before(() => {
    cy.execute('preparerLesPersonas', { ids: [mediateurSansActivites.id] })
  })

  it('Je vois la page d’erreur si j’upload un fichier invalide', () => {
    cy.signin(mediateurSansActivites)

    cy.visit(appUrl('/coop/mes-beneficiaires/importer'))
    cy.findByRole('heading', { name: 'Importer des bénéficiaires' })

    // Attendre l'hydratation AVANT d'attacher le fichier : le bouton de submit
    // n'est actif qu'une fois le formulaire interactif. Si on attache avant,
    // l'onChange React n'est pas encore monté → la valeur du fichier est perdue
    // et le submit part sans fichier (on reste sur /importer). Une fois le bouton
    // actif, l'onChange capte le fichier et le clic déclenche l'upload client.
    cy.findByRole('button', {
      name: 'Vérifier le fichier avant import',
    }).should('be.enabled')

    cy.get('input[type="file"][name="file"]').attachFile(
      'import-beneficiaires-invalide.xlsx',
    )
    cy.findByRole('button', {
      name: 'Vérifier le fichier avant import',
    }).click()

    // Generous timeout: the redirect only happens once the analyse route handler
    // has answered, which can be slow on a cold (uncompiled) dev server.
    cy.url({ timeout: 30_000 }).should(
      'contain',
      appUrl('/coop/mes-beneficiaires/importer/erreur'),
    )
    cy.findByRole('heading', { name: 'Erreur lors de l’analyse du fichier' })
  })

  it('Je peux importer le fichier d’exemple', () => {
    cy.signin(mediateurSansActivites)

    cy.visit(appUrl('/coop/mes-beneficiaires/importer'))

    cy.intercept('/coop/mes-beneficiaires/importer/analyse').as('mutation')

    cy.findByRole('heading', { name: 'Importer des bénéficiaires' })
    // Find link with title "Télécharger le modèle"
    cy.findByRole('link', { name: 'Télécharger le modèle' }).click()
    // This downloads the file in the cypress/downloads folder

    // Should display error as we did not upload a file
    cy.findByRole('button', {
      name: 'Vérifier le fichier avant import',
    }).click()
    cy.get('form p.fr-error-text').should(
      'have.text',
      'Veuillez sélectionner un fichier',
    )

    cy.get('input[type="file"][name="file"]').attachFile(
      'import-beneficiaires-modele.xlsx',
    )

    cy.findByRole('button', {
      name: 'Vérifier le fichier avant import',
    }).click()

    cy.wait('@mutation')

    cy.url().should(
      'contain',
      appUrl('/coop/mes-beneficiaires/importer/analyse/'),
    )

    cy.findByRole('heading', { name: 'Analyse du fichier à importer' }).should(
      'be.visible',
    )

    cy.contains('Aucune erreur détectée')

    // Visible in the analysis table
    cy.findByRole('cell', { name: 'Exemple' }).should('be.visible')
    cy.findByRole('cell', { name: 'Léa' }).should('be.visible')
    cy.findByRole('cell', { name: '1970' }).should('be.visible')
    cy.findByRole('cell', { name: '32057' }).should('be.visible')

    // Find and click button "Valider l’import"
    cy.findByRole('button', { name: 'Valider l’import' }).click()

    // We should be redirected to the beneficiaires list page
    cy.appUrlShouldBe('/coop/mes-beneficiaires')
    cy.getToast(/1 bénéficiaire importé/i).should('exist')

    // Visible in beneficiaires list
    cy.findByRole('cell', { name: 'Exemple' }).should('be.visible')
    cy.findByRole('cell', { name: 'Léa' }).should('be.visible')
  })
})

describe('ETQ Visiteur, je ne peux pas faire analyser un fichier d’import', () => {
  it('L’analyse refuse une requête sans session', () => {
    cy.request({
      method: 'POST',
      url: appUrl('/coop/mes-beneficiaires/importer/analyse'),
      failOnStatusCode: false,
    })
      .its('status')
      .should('eq', 401)
  })
})

describe('ETQ Médiateur, je ne peux pas faire analyser un fichier trop lourd', () => {
  before(() => {
    cy.execute('preparerLesPersonas', { ids: [mediateurSansActivites.id] })
  })

  it('L’analyse refuse un fichier de plus de 5 Mo', () => {
    cy.signin(mediateurSansActivites)
    cy.visit(appUrl('/coop/mes-beneficiaires/importer'))

    cy.window()
      .then((fenetre) => {
        const formulaire = new fenetre.FormData()
        formulaire.append(
          'file',
          new fenetre.Blob([new Uint8Array(5 * 1024 * 1024 + 1)]),
          'trop-lourd.xlsx',
        )
        return fenetre
          .fetch(appUrl('/coop/mes-beneficiaires/importer/analyse'), {
            method: 'POST',
            body: formulaire,
          })
          .then(({ status }) => status)
      })
      .should('eq', 413)
  })
})
