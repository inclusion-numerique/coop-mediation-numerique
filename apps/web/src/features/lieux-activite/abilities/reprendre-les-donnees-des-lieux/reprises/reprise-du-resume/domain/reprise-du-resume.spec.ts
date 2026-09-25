import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { resumeADescendre } from './reprise-du-resume'

const TROP_LONG = 'x'.repeat(281)

const descente = (
  presentationResume: string | null,
  presentationDetail: string | null = null,
) =>
  resumeADescendre(lieuAReprendre({ presentationResume, presentationDetail }))

describe('le résumé trop long', () => {
  it('descend dans une description vide', () => {
    expect(descente(TROP_LONG)).toBe(TROP_LONG)
  })

  it('rejoint la description déjà écrite', () => {
    expect(descente(TROP_LONG, 'Un espace ouvert.')).toBe(
      `Un espace ouvert.\n\n${TROP_LONG}`,
    )
  })

  it('ne se redit pas quand la description le porte déjà', () => {
    expect(descente(TROP_LONG, TROP_LONG)).toBe(TROP_LONG)
  })

  it('ne concerne pas un résumé de longueur acceptable', () => {
    expect(descente('x'.repeat(280))).toBeNull()
  })

  it('ne concerne pas un lieu sans résumé', () => {
    expect(descente(null)).toBeNull()
  })

  it('renonce plutôt que de dépasser la longueur du détail', () => {
    expect(descente(TROP_LONG, 'y'.repeat(10_000))).toBeNull()
  })
})
