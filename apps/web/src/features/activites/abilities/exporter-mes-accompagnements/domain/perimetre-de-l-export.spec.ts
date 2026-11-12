import { CoordinateurId, MediateurId } from '../../../domain'
import { CodesPostaux } from './codes-postaux'
import {
  type Demandeur,
  estUnExportPersonnel,
  mediateursAutorises,
  perimetreDeLExport,
} from './perimetre-de-l-export'

const moi = MediateurId('6c1f4a3e-2f7b-4c55-9a0e-1d2b3c4d5e6f')
const membre = MediateurId('7d2a5b4f-3a8c-4d66-8b1f-2e3c4d5e6f70')
const ancien = MediateurId('8e3b6c5a-4b9d-4e77-9c2a-3f4d5e6f7081')
const etranger = MediateurId('9f4c7d6b-5cae-4f88-8d3b-405e6f708192')
const coordinateur = CoordinateurId('a05d8e7c-6dbf-4a99-9e4c-516f70819203')

const mediateurSeul: Demandeur = {
  mediateurId: moi,
  coordinateurId: null,
  equipe: [],
}

const coordinateurMediateur: Demandeur = {
  mediateurId: moi,
  coordinateurId: coordinateur,
  equipe: [membre, ancien],
}

describe('périmètre de l’export', () => {
  it('autorise le médiateur, puis son équipe et ses anciens membres', () => {
    expect(mediateursAutorises(coordinateurMediateur)).toEqual([
      moi,
      membre,
      ancien,
    ])
  })

  it('autorise seulement l’équipe d’un coordinateur qui n’est pas médiateur', () => {
    expect(
      mediateursAutorises({ ...coordinateurMediateur, mediateurId: null }),
    ).toEqual([membre, ancien])
  })

  it('sans filtre de médiateurs, exporte tout le périmètre autorisé', () => {
    expect(perimetreDeLExport([moi, membre], [])).toEqual([moi, membre])
  })

  it('avec un filtre, ne garde que les médiateurs autorisés qui y figurent', () => {
    expect(
      perimetreDeLExport([moi, membre, ancien], [ancien, etranger]),
    ).toEqual([ancien])
  })

  it('un filtre sur un médiateur étranger donne un périmètre vide, jamais levé', () => {
    expect(perimetreDeLExport([moi, membre], [etranger])).toEqual([])
  })

  it('l’export est personnel pour un médiateur sans équipe', () => {
    expect(
      estUnExportPersonnel(mediateurSeul, mediateursAutorises(mediateurSeul)),
    ).toBe(true)
  })

  it('l’export n’est pas personnel dès qu’une équipe est autorisée', () => {
    expect(
      estUnExportPersonnel(
        coordinateurMediateur,
        mediateursAutorises(coordinateurMediateur),
      ),
    ).toBe(false)
  })

  it('l’export n’est pas personnel pour un coordinateur qui n’est pas médiateur', () => {
    const demandeur = {
      ...coordinateurMediateur,
      mediateurId: null,
      equipe: [membre],
    }
    expect(
      estUnExportPersonnel(demandeur, mediateursAutorises(demandeur)),
    ).toBe(false)
  })
})

describe('codes postaux', () => {
  it.each(['69002', '45100,45000', '06100, 06000, 06200'])(
    'accepte « %s »',
    (valeur) => {
      expect(CodesPostaux.safe(valeur)).toBe(valeur)
    },
  )

  it.each(['', ' ', '6900', 'Lyon'])('refuse « %s »', (valeur) => {
    expect(CodesPostaux.safe(valeur)).toBeNull()
  })
})
