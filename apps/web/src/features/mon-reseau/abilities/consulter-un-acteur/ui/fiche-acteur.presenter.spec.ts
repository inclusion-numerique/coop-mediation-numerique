import { CoordinateurId, Effectif } from '../../../domain'
import type { RegardDuLecteur } from '../domain'
import {
  actionsDEquipe,
  membreDeLEquipe,
  statutAffiche,
} from './fiche-acteur.presenter'

const coordinateurId = CoordinateurId('e1b2c3d4-0000-4000-8000-000000000001')

const regardDuCoordinateur = (
  relation: Extract<RegardDuLecteur, { _tag: 'Coordinateur' }>['relation'],
): RegardDuLecteur => ({ _tag: 'Coordinateur', coordinateurId, relation })

const membre = {
  _tag: 'Membre',
  statistiques: {
    beneficiairesAccompagnes: Effectif(4),
    accompagnements: Effectif(9),
  },
  contrat: null,
} as const

describe('présentation de la fiche d’un acteur', () => {
  it.each([
    [{ _tag: 'Actif' } as const, 'Actif', 'success'],
    [{ _tag: 'JamaisActif' } as const, 'Inactif', 'warning'],
    [
      {
        _tag: 'InactifDepuis',
        derniereActivite: new Date('2026-09-01T12:00:00Z'),
      } as const,
      'Inactif depuis le 01.09.2026',
      'warning',
    ],
  ])('affiche le statut %j', (statut, libelle, severite) => {
    expect(statutAffiche(statut)).toMatchObject({ libelle, severite })
  })

  it('ne propose rien à un médiateur', () => {
    expect(actionsDEquipe({ _tag: 'Mediateur' })).toEqual({
      inviter: false,
      retirer: false,
      invitationEnvoyeeLe: null,
      archive: null,
    })
  })

  it('propose d’inviter un acteur hors équipe', () => {
    expect(
      actionsDEquipe(regardDuCoordinateur({ _tag: 'HorsEquipe' })),
    ).toMatchObject({
      inviter: true,
      retirer: false,
    })
  })

  it('propose d’inviter de nouveau ou de supprimer des archives un ancien membre', () => {
    expect(
      actionsDEquipe(
        regardDuCoordinateur({
          _tag: 'AncienMembre',
          depuis: new Date('2026-01-01'),
          fin: new Date('2026-03-01'),
        }),
      ),
    ).toEqual({
      inviter: true,
      retirer: false,
      invitationEnvoyeeLe: null,
      archive: { depuis: new Date('2026-01-01'), fin: new Date('2026-03-01') },
    })
  })

  it('propose de retirer un membre et montre ses statistiques', () => {
    const regard = regardDuCoordinateur(membre)
    expect(actionsDEquipe(regard)).toMatchObject({
      retirer: true,
      inviter: false,
    })
    expect(membreDeLEquipe(regard)).toEqual(membre)
  })

  it('ne propose rien sur un acteur qui ne se coordonne pas', () => {
    expect(
      actionsDEquipe(regardDuCoordinateur({ _tag: 'NonCoordonnable' })),
    ).toMatchObject({ inviter: false, retirer: false })
  })
})
