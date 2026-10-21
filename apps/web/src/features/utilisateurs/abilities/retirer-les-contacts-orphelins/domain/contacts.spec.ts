import { contactsAReconcilier, orphelinsParmi } from './contacts'

describe('contacts Brevo à réconcilier', () => {
  const contacts = [
    {
      courriel: 'deleted+abcdef012345@coop-numerique.anct.gouv.fr',
      identifiantExterne: 'u1',
    },
    { courriel: 'deleted+abc@example.com', identifiantExterne: 'u2' },
    { courriel: 'vivant@example.com', identifiantExterne: 'u3' },
    { courriel: 'parti@example.com', identifiantExterne: 'u4' },
    { courriel: null, identifiantExterne: 'u5' },
    { courriel: 'sans-id@example.com', identifiantExterne: null },
  ]

  it('ne prend pour anonymisé que ce que l’effacement a fabriqué', () => {
    expect(contactsAReconcilier(contacts).anonymises).toEqual([
      'deleted+abcdef012345@coop-numerique.anct.gouv.fr',
    ])
  })

  it('rapproche des comptes les contacts qui portent un identifiant', () => {
    expect(
      contactsAReconcilier(contacts).rattaches.map(
        ({ utilisateurId }) => utilisateurId,
      ),
    ).toEqual(['u2', 'u3', 'u4'])
  })

  it('désigne comme orphelins les contacts sans inscrit vivant', () => {
    expect(
      orphelinsParmi(contactsAReconcilier(contacts).rattaches, new Set(['u3'])),
    ).toEqual(['deleted+abc@example.com', 'parti@example.com'])
  })
})
