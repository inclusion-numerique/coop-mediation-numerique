describe('API v1 documentation', () => {
  it('Les specifications de l’API sont accessibles', () =>
    // should validate json response '/api/v1/openapi'
    cy
      .request('/api/v1/openapi')
      .then((response) => {
        expect(response.status).to.eq(200)
        // The rest should be unit tested in the openapi route integration test itself
        expect(response.body).to.have.property('openapi')
        expect(response.body).to.have.property('info')
        expect(response.body).to.have.property('paths')
        expect(response.body).to.have.property('tags')
      }))

  it('La documentation de l’API est accessible', () => {
    cy.visit('/api/v1/documentation')
    cy.contains('La coop - API')
    cy.contains('Pour obtenir votre bearer')

    // Check that css are loaded and applied
    cy.get('.section-header')
      .first()
      .should('have.css', 'margin-bottom', '12px')
  })
})
