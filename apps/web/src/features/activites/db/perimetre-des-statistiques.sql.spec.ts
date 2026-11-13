import { CoordinateurId, MediateurId, PERIMETRE_NATIONAL } from '../domain'
import { dansLePerimetre } from './perimetre-des-statistiques.sql'

const MEDIATEUR = MediateurId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e01')
const COORDINATEUR = CoordinateurId('9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d')

describe('périmètre SQL des statistiques', () => {
  it('ne restreint rien au niveau national', () => {
    expect(dansLePerimetre(PERIMETRE_NATIONAL).sql).toBe('TRUE')
  })

  it('restreint aux activités du médiateur', () => {
    const sql = dansLePerimetre({ type: 'Mediateur', mediateur: MEDIATEUR })
    expect(sql.sql).toBe('act.mediateur_id = ?::uuid')
    expect(sql.values).toEqual([MEDIATEUR])
  })

  it('restreint une équipe à ses membres, pendant leur appartenance', () => {
    const sql = dansLePerimetre({
      type: 'Equipe',
      coordinateur: COORDINATEUR,
      membres: [MEDIATEUR],
    })
    expect(sql.sql).toMatch(/^act\.mediateur_id = ANY\(\?::uuid\[\]\) AND \(/)
    expect(sql.values).toEqual([[MEDIATEUR], COORDINATEUR, COORDINATEUR])
  })
})
