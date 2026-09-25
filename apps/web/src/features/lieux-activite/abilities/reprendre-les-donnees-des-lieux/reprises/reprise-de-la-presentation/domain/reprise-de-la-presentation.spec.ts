import { relever } from '../../../domain'
import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import {
  presentationAReprendre,
  presentationNettoyee,
  repriseDeLaPresentation,
} from './reprise-de-la-presentation'

const verdict = (
  presentationResume: string | null,
  presentationDetail: string | null,
) =>
  presentationAReprendre(
    lieuAReprendre({ presentationResume, presentationDetail }),
  )

const cellule = async (
  presentationResume: string | null,
  presentationDetail: string | null,
) =>
  (
    await relever(
      [repriseDeLaPresentation(async () => undefined)],
      [lieuAReprendre({ presentationResume, presentationDetail })],
    )
  ).lieux.flatMap(({ constats }) =>
    constats.flatMap(({ mentions }) => mentions),
  )[0]?.cellule

describe('la présentation, nettoyée selon le standard', () => {
  it('ne concerne pas un lieu sans présentation', () => {
    expect(verdict(null, null)).toBeNull()
  })

  it('laisse en place une présentation propre, paragraphes compris', () => {
    expect(
      verdict(
        'Un espace numérique.',
        'Des ateliers :\n\n- collectifs\n- individuels',
      ),
    ).toBeNull()
  })

  it('relève un résumé aux espaces en trop', () => {
    expect(verdict('Le  LAM accueille', null)).toEqual({
      resume: true,
      detail: false,
    })
  })

  it('relève un détail en HTML', () => {
    expect(verdict(null, '<p>Le PIME accueille</p>')).toEqual({
      resume: false,
      detail: true,
    })
  })

  it('nettoie le HTML sans perdre les paragraphes', () => {
    expect(presentationNettoyee('<p>Premier</p><p>Second &amp; fin</p>')).toBe(
      'Premier\n\nSecond & fin',
    )
  })

  it('vide ce qui n’était que du blanc', () => {
    expect(presentationNettoyee('   ')).toBeNull()
  })

  it.each([
    ['le résumé', 'Le  LAM', null, 'résumé à corriger'],
    ['le détail', null, 'Le  PIME', 'détail à corriger'],
    ['les deux', 'Le  LAM', 'Le  PIME', 'résumé et détail à corriger'],
  ])(
    'dit au relevé quand corriger %s',
    async (_cas, resume, detail, attendue) => {
      expect(await cellule(resume, detail)).toBe(attendue)
    },
  )
})
