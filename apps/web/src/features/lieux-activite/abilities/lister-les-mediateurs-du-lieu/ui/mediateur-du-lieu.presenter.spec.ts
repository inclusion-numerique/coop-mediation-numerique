import { ProfilDuMediateur } from '../domain'
import {
  dateDeDerniereActivite,
  hrefDeLActeur,
  iconeDuProfil,
  libelleDesLieux,
  libelleDuProfil,
} from './mediateur-du-lieu.presenter'

describe('présentation d’un médiateur du lieu', () => {
  it('nomme un coordinateur hors dispositif', () => {
    expect(
      libelleDuProfil(ProfilDuMediateur('CoordinateurHorsDispositif')),
    ).toBe('Coordinateur·rice hors dispositif')
  })

  it('n’a pas d’icône pour un médiateur hors dispositif', () => {
    expect(iconeDuProfil(ProfilDuMediateur('Mediateur'))).toBeNull()
  })

  it('mène à la fiche de l’acteur, ancrée sur lui', () => {
    expect(hrefDeLActeur('15', 'acteur-1', 'acteur-1')).toBe(
      '/coop/mon-reseau/15/acteurs/acteur-1#acteur-1',
    )
  })

  it.each([
    [1, '1 lieu d’activité'],
    [2, '2 lieux d’activité'],
  ])('compte %i lieu(x)', (nombre, attendu) => {
    expect(libelleDesLieux(nombre)).toBe(attendu)
  })

  it('n’a pas de date quand le médiateur n’a jamais exercé ici', () => {
    expect(dateDeDerniereActivite({ _tag: 'Jamais' })).toBeNull()
  })
})
