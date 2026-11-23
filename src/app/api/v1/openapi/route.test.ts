describe('API v1 openapi', () => {
  it('Les specifications de l’API sont accessibles', () =>
    cy.request('/api/v1/openapi').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('openapi', '3.0.0')
      expect(response.body.info).to.have.property('title', 'La coop - API')
      expect(response.body).to.have.property('paths')
      expect(response.body).to.have.property('tags')
    }))
})
