import { appUrl } from '../../support/helpers'

describe('ETQ Utilisateur, je peux me connecter à mon compte / me déconnecter avec ProConnect', () => {
  /**
   * US https://www.notion.so/ETQ-Utilisateur-je-peux-me-connecter-mon-compte-me-d-connecter-8a4ed652501042fd8445df6a2d2273df?pvs=4
   * Parcours https://www.figma.com/file/4wfmwOaKRnMhgiGEF256qS/La-Base---Parcours-utilisateurs?node-id=38%3A1135&t=mLwaw4Kkwt7FG9lz-1
   */

  // Cet utilisateur existe chez ProConnect, pas dans notre base.
  //
  // Sur `fca.integ01.dev-agentconnect.fr`, le parcours qui suit la saisie de l'email dépend
  // du compte de test fourni par l'environnement, et les deux variantes coexistent :
  //
  //  - fournisseur d'identité simulé (`test-idp.proconnect.gouv.fr`) : aucun mot de passe,
  //    aucune sélection d'organisation, et une identité fixe « John Doe » ;
  //  - `identite-sandbox.proconnect.gouv.fr` : mot de passe puis choix de l'organisation,
  //    avec l'identité propre au compte.
  //
  // Le poste de développement et la CI n'utilisent pas le même compte : décrire un seul des
  // deux parcours fait échouer l'autre. Le test les couvre donc tous les deux, en se
  // branchant sur l'URL atteinte, jusqu'à ce que les deux environnements soient alignés.
  const proConnectUser = {
    email: Cypress.env('PROCONNECT_TEST_USER_EMAIL') as string,
    password: Cypress.env('PROCONNECT_TEST_USER_PASSWORD') as string,
  }

  const identiteFournisseurSimule = { firstName: 'John', lastName: 'Doe' }
  const identiteSandbox = { firstName: 'Jean', lastName: 'User' }

  before(() => {
    cy.execute('deleteUser', { email: proConnectUser.email })
  })

  it('Préliminaire - Les pages de connexions sont accessibles', () => {
    cy.visit('/')
    cy.get('.fr-header__tools').contains('Se connecter').click()
    cy.url().should('equal', appUrl('/connexion'))
  })

  it('Acceptation 1 - Connexion avec ProConnect', () => {
    cy.visit('/connexion')
    // Cypress deletes some cookies on redirection between domains
    // See https://github.com/cypress-io/cypress/issues/20476
    // Also see https://docs.cypress.io/guides/guides/cross-origin-testing
    // We need to intercept the request to our auth endpoint to memorize the cookies
    // then intercept the request for our auth endpoint during callback to add the cookies back
    let authenticationCookies: string[]

    cy.intercept(/\/api\/auth\/signin\/proconnect/, (request) => {
      request.continue((response) => {
        // Memorize our cookies
        const responseCookies = response.headers['set-cookie']
        authenticationCookies = Array.isArray(responseCookies)
          ? responseCookies
          : [responseCookies]
      })
    })

    cy.get('button[title="S’identifier avec ProConnect"]').click()
    cy.url().should('contain', 'fca.integ01.dev-agentconnect.fr')

    cy.intercept(/\/api\/auth\/callback/, (request) => {
      // Add our cookies back
      request.headers.cookie = authenticationCookies.join('; ')
    })

    cy.get('#email-input').type(`${proConnectUser.email}{enter}`)

    // Renseignée dans le branchement ci-dessous, puis lue au moment des assertions
    // d'identité — jamais à l'empilement des commandes Cypress.
    let identiteAttendue = identiteFournisseurSimule

    cy.url().then((url) => {
      if (url.includes('test-idp.proconnect.gouv.fr')) {
        // Fournisseur d'identité simulé : on confirme l'identité (email, sub, niveau ACR)
        // d'un simple clic, et il n'y a pas d'organisation à choisir.
        cy.contains('button', 'Se connecter').click()
        return
      }

      // identite-sandbox : mot de passe, puis sélection de l'organisation.
      identiteAttendue = identiteSandbox
      cy.get('#password-input').type(`${proConnectUser.password}{enter}`)
      cy.get('.fr-tile__link').first().click()
    })

    // Cookies are lost in redirect (Cypress issue)
    // https://github.com/cypress-io/cypress/issues/20476#issuecomment-1298486439

    cy.url().should('equal', appUrl('/inscription/choisir-role'))

    cy.get('.fr-header__tools').should('not.contain', 'Se connecter')

    cy.log('Check that the user can logout')

    cy.dsfrShouldBeStarted()
    cy.dsfrCollapsesShouldBeBound()
    // `identiteAttendue` est lue ici, à l'exécution : la référencer directement en argument
    // de `.contains()` la figerait à sa valeur d'avant le branchement.
    cy.get('.fr-header__tools button[aria-controls="header-user-menu"]').then(
      ($menu) => {
        cy.wrap($menu)
          .contains(identiteAttendue.firstName)
          .contains(identiteAttendue.lastName)
          .click()
      },
    )

    cy.get('#header-user-menu').should('be.visible')

    cy.get('#header-user-menu').contains('Se déconnecter').click()

    cy.url().should('equal', appUrl('/deconnexion'))
    cy.contains('Êtes-vous sûr de vouloir vous déconnecter ?')
    cy.get('main').contains('Se déconnecter').click()

    // On n'affirme plus le passage par l'URL de déconnexion du fournisseur
    // d'identité : c'est une étape de redirection fugace, dont le domaine a déjà
    // changé deux fois (moncomptepro -> identite-sandbox -> …), et que Cypress
    // rate quand le rebond est immédiat. Ce qui compte est l'état d'arrivée.
    cy.url().should('equal', appUrl('/'))

    cy.get('.fr-header__tools').contains('Se connecter')
  })
})
