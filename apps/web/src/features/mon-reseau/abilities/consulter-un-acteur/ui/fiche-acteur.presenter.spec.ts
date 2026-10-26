import { CoordinateurId, Effectif } from '../../../domain'
import {
  coordinateurConseillerNumerique,
  mediateurHorsDispositif,
} from '../../../domain/fixtures'
import type { RegardDuLecteur } from '../domain'
import {
  actionsDEquipe,
  ancienMembreDe,
  contratVisible,
  encartDeLEmployeuse,
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

  it('donne de quoi supprimer un ancien membre des archives', () => {
    expect(
      ancienMembreDe(
        regardDuCoordinateur({
          _tag: 'AncienMembre',
          depuis: new Date('2026-01-01'),
          fin: new Date('2026-03-01'),
        }),
      ),
    ).toEqual({
      coordinateurId,
      depuis: new Date('2026-01-01'),
      fin: new Date('2026-03-01'),
    })
    expect(ancienMembreDe({ _tag: 'Mediateur' })).toBeNull()
  })

  it('montre le référent de la structure aux seuls membres de l’équipe', () => {
    expect(
      encartDeLEmployeuse(
        mediateurHorsDispositif,
        regardDuCoordinateur(membre),
      ),
    ).toEqual({ referentVisible: true, avisAuxConseillersNumeriques: false })
    expect(
      encartDeLEmployeuse(coordinateurConseillerNumerique, {
        _tag: 'Mediateur',
      }),
    ).toEqual({ referentVisible: false, avisAuxConseillersNumeriques: true })
  })

  it('montre le contrat des seuls conseillers numériques membres de l’équipe', () => {
    expect(
      contratVisible(
        coordinateurConseillerNumerique,
        regardDuCoordinateur(membre),
      ),
    ).toBe(true)
    expect(
      contratVisible(mediateurHorsDispositif, regardDuCoordinateur(membre)),
    ).toBe(false)
    expect(
      contratVisible(coordinateurConseillerNumerique, { _tag: 'Mediateur' }),
    ).toBe(false)
  })
})
