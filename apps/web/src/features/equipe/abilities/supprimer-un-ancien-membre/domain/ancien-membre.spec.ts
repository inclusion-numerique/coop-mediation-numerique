import { adhesionActive, adhesionArchivee } from '../../../domain/fixtures'
import { exigerAncienMembre } from './ancien-membre'

describe('supprimer définitivement un ancien membre', () => {
  it('vise toutes ses adhésions archivées', () => {
    expect(exigerAncienMembre([adhesionArchivee])).toEqual({
      success: true,
      data: [adhesionArchivee],
    })
  })

  it('est refusé tant qu’il fait partie de l’équipe', () => {
    expect(exigerAncienMembre([adhesionArchivee, adhesionActive])).toEqual({
      success: false,
      error: { _tag: 'ToujoursMembre' },
    })
  })

  it('est refusé à qui n’a jamais été membre', () => {
    expect(exigerAncienMembre([])).toEqual({
      success: false,
      error: { _tag: 'PasAncienMembre' },
    })
  })
})
