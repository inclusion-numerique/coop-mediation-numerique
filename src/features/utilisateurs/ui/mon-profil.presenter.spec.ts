import { describe, expect, it } from 'vitest'
import { identiteDuProfil, sectionsDuProfil } from './mon-profil.presenter'

describe('présentation de mon profil', () => {
  it('affiche le téléphone au format national', () => {
    expect(
      identiteDuProfil({
        name: 'Jeanne Martin',
        email: 'jeanne@example.com',
        phone: '+33612345678',
      }),
    ).toEqual({
      nom: 'Jeanne Martin',
      courriel: 'jeanne@example.com',
      telephone: '06 12 34 56 78',
    })
  })

  it('n’affiche pas de téléphone absent', () => {
    expect(
      identiteDuProfil({ name: null, email: 'jeanne@example.com', phone: null })
        .telephone,
    ).toBeNull()
  })

  it('montre à un coordinateur son contrat et l’activation de la médiation', () => {
    expect(
      sectionsDuProfil({ coordinateur: true, conseillerNumerique: false }),
    ).toEqual({ contrat: true, mediation: true, suppression: true })
  })

  it('montre son contrat à un conseiller numérique sans lui proposer de supprimer son compte', () => {
    expect(
      sectionsDuProfil({ coordinateur: false, conseillerNumerique: true }),
    ).toEqual({ contrat: true, mediation: false, suppression: false })
  })

  it('ne montre que la suppression à un médiateur hors dispositif', () => {
    expect(
      sectionsDuProfil({ coordinateur: false, conseillerNumerique: false }),
    ).toEqual({ contrat: false, mediation: false, suppression: true })
  })
})
