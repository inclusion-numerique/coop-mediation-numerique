import { mount } from 'cypress/react'
import '../../src/styles/app.css'
import './commands'
import './component.css'
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

startReactDsfr({ defaultColorScheme: 'system' })

Cypress.Commands.add('mount', mount)
