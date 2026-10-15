import { adherer, archiver } from './adhesion'
import {
  adhesionActive,
  adhesionArchivee,
  coordinateurId,
  mediateurId,
} from './fixtures'

const maintenant = new Date('2026-10-14T09:00:00Z')

describe('archiver une adhésion', () => {
  it('archive l’adhésion active, pas une ancienne', () => {
    expect(archiver([adhesionArchivee, adhesionActive], maintenant)).toEqual({
      success: true,
      data: { ...adhesionActive, statut: 'Archivee', archiveeLe: maintenant },
    })
  })

  it('échoue quand le médiateur n’est plus membre', () => {
    expect(archiver([adhesionArchivee], maintenant)).toEqual({
      success: false,
      error: { _tag: 'PasMembre' },
    })
  })
})

describe('adhérer à une équipe', () => {
  const nouvelle = { mediateurId, coordinateurId }

  it('est possible pour un ancien membre', () => {
    expect(adherer(nouvelle, [adhesionArchivee])).toEqual({
      success: true,
      data: nouvelle,
    })
  })

  it('est refusé à un membre actif', () => {
    expect(adherer(nouvelle, [adhesionActive])).toEqual({
      success: false,
      error: { _tag: 'DejaMembre', mediateurId },
    })
  })
})
