import { describe, expect, it } from 'vitest'
import {
  type Accueil,
  consulterLAccueil,
  type ProfilDAccueil,
  selonLeProfil,
  type Visiteur,
} from './accueil'
import { CoordinateurId } from './coordinateur-id'
import { Email } from './email'
import { MediateurId } from './mediateur-id'
import { NomComplet } from './nom-complet'
import { Prenom } from './prenom'
import { Salutation } from './salutation'

const coordinateur: ProfilDAccueil = {
  _tag: 'Coordinateur',
  coordinateurId: CoordinateurId('9b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e'),
}

const mediateur: ProfilDAccueil = {
  _tag: 'Mediateur',
  mediateurId: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
  bienvenue: false,
}

const sections = {
  Coordinateur: () => 'coordination',
  Mediateur: () => 'médiation',
}

const visiteur: Visiteur = {
  prenom: Prenom('Camille'),
  nomComplet: NomComplet('Camille Martin'),
  email: Email('camille.martin@example.fr'),
  mediateurId: null,
  coordinateurId: null,
  presentationVue: false,
}

const visiteurMediateur: Visiteur = {
  ...visiteur,
  mediateurId: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
}

describe('accueil selon le profil', () => {
  it('compose l’accueil d’un coordinateur', () => {
    expect(selonLeProfil(coordinateur, sections)).toBe('coordination')
  })

  it('compose l’accueil d’un médiateur', () => {
    expect(selonLeProfil(mediateur, sections)).toBe('médiation')
  })
})

describe('consulter l’accueil', () => {
  it('n’accueille pas un visiteur qui n’est ni médiateur ni coordinateur', () => {
    expect(consulterLAccueil(visiteur)).toBeNull()
  })

  it('accueille un coordinateur par son prénom, même s’il est aussi médiateur', () => {
    expect(
      consulterLAccueil({
        ...visiteurMediateur,
        coordinateurId: CoordinateurId('9b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e'),
      }),
    ).toEqual<Accueil>({
      salutation: Salutation('Camille'),
      profil: coordinateur,
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
    ({ presentationVue, bienvenue }) => {
      expect(
        consulterLAccueil({ ...visiteurMediateur, presentationVue }),
      ).toMatchObject({ profil: { ...mediateur, bienvenue } })
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
  ])('salue le visiteur par $cas', ({ identite, attendue }) => {
    expect(
      consulterLAccueil({ ...visiteurMediateur, ...identite }),
    ).toMatchObject({ salutation: Salutation(attendue) })
  })
})
