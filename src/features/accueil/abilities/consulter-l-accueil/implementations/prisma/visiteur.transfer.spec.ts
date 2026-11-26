import { describe, expect, it } from 'vitest'
import {
  CoordinateurId,
  Email,
  MediateurId,
  NomComplet,
  Prenom,
} from '../../domain'
import { versVisiteur } from './visiteur.transfer'

const utilisateur = {
  firstName: 'Camille',
  name: 'Camille Martin',
  email: 'camille@example.org',
  hasSeenOnboarding: null,
  mediateur: { id: 'a3c1c0d2-5b7e-4f7a-9d1e-2f8b6c4d0e11' },
  coordinateur: null,
}

describe('visiteur lu en base', () => {
  it('lit l’identité et le profil du visiteur', () => {
    expect(versVisiteur(utilisateur)).toEqual({
      prenom: Prenom('Camille'),
      nomComplet: NomComplet('Camille Martin'),
      email: Email('camille@example.org'),
      mediateurId: MediateurId('a3c1c0d2-5b7e-4f7a-9d1e-2f8b6c4d0e11'),
      coordinateurId: null,
      presentationVue: false,
    })
  })

  it('lit comme absents un prénom et un nom vides', () => {
    expect(
      versVisiteur({ ...utilisateur, firstName: ' ', name: null }),
    ).toMatchObject({ prenom: null, nomComplet: null })
  })

  it('lit le coordinateur et la présentation vue', () => {
    expect(
      versVisiteur({
        ...utilisateur,
        hasSeenOnboarding: new Date('2026-10-01T10:00:00Z'),
        coordinateur: { id: 'b4d2d1e3-6c8f-4a8b-8e2f-3a9c7d5e1f22' },
      }),
    ).toMatchObject({
      coordinateurId: CoordinateurId('b4d2d1e3-6c8f-4a8b-8e2f-3a9c7d5e1f22'),
      presentationVue: true,
    })
  })
})
