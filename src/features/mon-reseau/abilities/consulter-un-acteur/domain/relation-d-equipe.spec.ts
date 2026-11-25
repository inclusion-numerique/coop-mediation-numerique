import { describe, expect, it } from 'vitest'
import { CodeDepartement } from '@/libraries/insee'
import { NomAffiche } from '@/libraries/nom-affiche'
import {
  type Acteur,
  ActeurId,
  CoordinateurId,
  Courriel,
  Dispositif,
  Effectif,
  MediateurId,
  type Mediation,
} from '../../../domain'
import { lienDEquipe } from './relation-d-equipe'

const mediation: Mediation = {
  mediateurId: MediateurId('a1b2c3d4-0000-4000-8000-000000000001'),
  nombreDeLieux: Effectif(2),
  coordinateurs: [
    {
      acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000002'),
      nomAffiche: NomAffiche('Alex Durand'),
      departement: CodeDepartement('15'),
    },
  ],
}

const mediateurHorsDispositif: Acteur = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000003'),
  nomAffiche: NomAffiche('Camille Martin'),
  courriel: Courriel('camille.martin@example.org'),
  profil: {
    _tag: 'Mediateur',
    dispositif: Dispositif('HorsDispositif'),
    mediation,
  },
}

const coordinateurConseillerNumerique: Acteur = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000004'),
  nomAffiche: NomAffiche('Sacha Bernard'),
  courriel: Courriel('sacha.bernard@example.org'),
  profil: {
    _tag: 'Coordinateur',
    dispositif: Dispositif('ConseillerNumerique'),
    coordinateurId: CoordinateurId('a1b2c3d4-0000-4000-8000-000000000005'),
    mediation: null,
  },
}

const lecteur = {
  _tag: 'Coordinateur',
  acteurId: ActeurId('d1b2c3d4-0000-4000-8000-000000000001'),
  coordinateurId: CoordinateurId('d1b2c3d4-0000-4000-8000-000000000002'),
} as const

const sansLien = {
  lecteur,
  acteur: mediateurHorsDispositif,
  adhesions: [],
  invitationEnCours: null,
}

describe('lien d’équipe entre le coordinateur qui consulte et l’acteur', () => {
  it('ne coordonne pas un acteur qui ne fait pas de médiation', () => {
    expect(
      lienDEquipe({ ...sansLien, acteur: coordinateurConseillerNumerique }),
    ).toEqual({ _tag: 'NonCoordonnable' })
  })

  it('ne se coordonne pas lui-même', () => {
    expect(
      lienDEquipe({
        ...sansLien,
        acteur: { ...mediateurHorsDispositif, acteurId: lecteur.acteurId },
      }),
    ).toEqual({ _tag: 'NonCoordonnable' })
  })

  it('est hors équipe sans adhésion ni invitation', () => {
    expect(lienDEquipe(sansLien)).toEqual({ _tag: 'HorsEquipe' })
  })

  it('est membre avec une adhésion en cours, même invité', () => {
    expect(
      lienDEquipe({
        ...sansLien,
        adhesions: [{ _tag: 'EnCours' }],
        invitationEnCours: new Date('2026-10-01'),
      }),
    ).toEqual({ _tag: 'Membre' })
  })

  it('est invité quand une invitation attend sa réponse', () => {
    expect(
      lienDEquipe({ ...sansLien, invitationEnCours: new Date('2026-10-01') }),
    ).toEqual({ _tag: 'Invite', invitationLe: new Date('2026-10-01') })
  })

  it('est ancien membre depuis sa dernière adhésion terminée', () => {
    expect(
      lienDEquipe({
        ...sansLien,
        adhesions: [
          {
            _tag: 'Terminee',
            debut: new Date('2025-01-01'),
            fin: new Date('2025-06-01'),
          },
          {
            _tag: 'Terminee',
            debut: new Date('2026-01-01'),
            fin: new Date('2026-03-01'),
          },
        ],
      }),
    ).toEqual({
      _tag: 'AncienMembre',
      depuis: new Date('2026-01-01'),
      fin: new Date('2026-03-01'),
    })
  })
})
