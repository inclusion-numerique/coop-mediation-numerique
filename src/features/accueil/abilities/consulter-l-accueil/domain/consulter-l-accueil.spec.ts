import { describe, expect, it } from 'vitest'
import type { Visiteur } from './accueil'
import { consulterLAccueil } from './consulter-l-accueil'
import { CoordinateurId } from './coordinateur-id'
import { Email } from './email'
import { MediateurId } from './mediateur-id'
import { NomComplet } from './nom-complet'
import { Prenom } from './prenom'
import { Salutation } from './salutation'
import { UtilisateurId } from './utilisateur-id'

const utilisateurId = UtilisateurId('7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f')

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')

const coordinateurId = CoordinateurId('9b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e')

const visiteur: Visiteur = {
  prenom: Prenom('Camille'),
  nomComplet: NomComplet('Camille Martin'),
  email: Email('camille.martin@example.fr'),
  mediateurId,
  coordinateurId: null,
  presentationVue: false,
}

const consulter = (lu: Visiteur | null) =>
  consulterLAccueil({ lireLeVisiteur: async () => lu })({ utilisateurId })

describe('consulter l’accueil', () => {
  it('n’accueille pas un visiteur introuvable', async () => {
    expect(await consulter(null)).toEqual({
      success: false,
      error: { _tag: 'VisiteurIntrouvable' },
    })
  })

  it('n’accueille pas un visiteur qui n’est ni médiateur ni coordinateur', async () => {
    expect(await consulter({ ...visiteur, mediateurId: null })).toEqual({
      success: false,
      error: { _tag: 'SansProfilDAccueil' },
    })
  })

  it('accueille un coordinateur par son prénom, même s’il est aussi médiateur', async () => {
    expect(await consulter({ ...visiteur, coordinateurId })).toEqual({
      success: true,
      data: {
        salutation: Salutation('Camille'),
        profil: { _tag: 'Coordinateur', coordinateurId },
      },
    })
  })

  it.each<{ cas: string; presentationVue: boolean; bienvenue: boolean }>([
    { cas: 'souhaite la bienvenue', presentationVue: false, bienvenue: true },
    {
      cas: 'ne souhaite plus la bienvenue',
      presentationVue: true,
      bienvenue: false,
    },
  ])(
    '$cas au médiateur selon qu’il a vu la présentation',
    async ({ presentationVue, bienvenue }) => {
      expect(await consulter({ ...visiteur, presentationVue })).toEqual({
        success: true,
        data: {
          salutation: Salutation('Camille'),
          profil: { _tag: 'Mediateur', mediateurId, bienvenue },
        },
      })
    },
  )

  it.each<{ cas: string; identite: Partial<Visiteur>; attendue: string }>([
    {
      cas: 'son nom complet faute de prénom',
      identite: { prenom: null },
      attendue: 'Camille Martin',
    },
    {
      cas: 'son e-mail faute de prénom et de nom complet',
      identite: { prenom: null, nomComplet: null },
      attendue: 'camille.martin@example.fr',
    },
  ])('salue le visiteur par $cas', async ({ identite, attendue }) => {
    expect(await consulter({ ...visiteur, ...identite })).toEqual({
      success: true,
      data: {
        salutation: Salutation(attendue),
        profil: { _tag: 'Mediateur', mediateurId, bienvenue: true },
      },
    })
  })
})
