import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import type { ReactNode } from 'react'

export const monterAvecLUrl = (adresse: string, champ: ReactNode) => {
  const ecrites: UrlUpdateEvent[] = []
  cy.mount(
    <div data-cy="zone">
      <NuqsTestingAdapter
        searchParams={adresse}
        hasMemory
        onUrlUpdate={(evenement) => ecrites.push(evenement)}
      >
        {champ}
      </NuqsTestingAdapter>
    </div>,
  )
  return ecrites
}

export const derniereAdresse = (ecrites: UrlUpdateEvent[]) =>
  cy
    .wrap(ecrites)
    .should('have.length.greaterThan', 0)
    .then(() => ecrites.at(-1)?.queryString)
