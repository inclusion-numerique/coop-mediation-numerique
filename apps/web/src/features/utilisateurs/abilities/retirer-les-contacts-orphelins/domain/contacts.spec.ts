import {
  AdresseCourriel,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import {
  type CompteDuContact,
  type ContactBrevo,
  comptesRattaches,
  contactsAReconcilier,
  orphelinsParmi,
} from './contacts'

const vivant = UtilisateurId('3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f')
const parti = UtilisateurId('4d5e6f7a-8b9c-4d0e-9f1a-2b3c4d5e6f7a')
const anonymise = UtilisateurId('5e6f7a8b-9c0d-4e1f-8a2b-3c4d5e6f7a8b')

const contact = (courriel: string, compte: CompteDuContact): ContactBrevo => ({
  courriel: AdresseCourriel(courriel),
  compte,
})

describe('contacts Brevo à réconcilier', () => {
  const contacts = [
    contact('deleted+abcdef012345@coop-numerique.anct.gouv.fr', {
      _tag: 'Compte',
      utilisateurId: anonymise,
    }),
    contact('deleted+abc@example.com', { _tag: 'Inconnu' }),
    contact('vivant@example.com', { _tag: 'Compte', utilisateurId: vivant }),
    contact('parti@example.com', { _tag: 'Compte', utilisateurId: parti }),
    contact('sans-id@example.com', { _tag: 'Aucun' }),
  ]

  it('ne prend pour anonymisé que ce que l’effacement a fabriqué', () => {
    expect(contactsAReconcilier(contacts).anonymises).toEqual([
      'deleted+abcdef012345@coop-numerique.anct.gouv.fr',
    ])
  })

  it('rapproche des comptes les contacts qui portent un identifiant', () => {
    const { rattaches } = contactsAReconcilier(contacts)
    expect(rattaches.map(({ courriel }) => courriel)).toEqual([
      'deleted+abc@example.com',
      'vivant@example.com',
      'parti@example.com',
    ])
    expect(comptesRattaches(rattaches)).toEqual([vivant, parti])
  })

  it('désigne comme orphelins les contacts sans inscrit vivant', () => {
    expect(
      orphelinsParmi(
        contactsAReconcilier(contacts).rattaches,
        new Set([vivant]),
      ),
    ).toEqual(['deleted+abc@example.com', 'parti@example.com'])
  })
})
