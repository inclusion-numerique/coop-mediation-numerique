describe('API v1 /health', () => {
  it('demande de s’authentifier à un appel sans client API valide', () => {
    cy.request({ url: '/api/v1/health', failOnStatusCode: false }).then(
      (response) => {
        expect(response.status).to.eq(401)
      },
    )
  })

  it('rend l’état de l’API à un client API valide', () => {
    cy.execute('createApiClient', { nom: `e2e-health-${Date.now()}` }).then(
      ({ id, secret }) =>
        cy
          .request({
            url: '/api/v1/health',
            headers: { authorization: `Bearer ${id}:${secret}` },
          })
          .then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.deep.eq({ status: 'ok' })
          }),
    )
  })
})
