describe('API v1 documentation', () => {
  it('La documentation de l’API est accessible', () => {
    cy.visit('/api/v1/documentation')
    cy.contains('La coop - API')
    cy.contains('Pour obtenir votre bearer')
    cy.get('.section-header').first().should('have.css', 'margin-bottom', '6px')
  })
})
