import { MediateurId } from '../../../domain'
import {
  optionsDeRecherche,
  optionsRechercheTropCourte,
  rechercheTropCourte,
} from './mediateurs-a-inviter.presenter'

const mediateur = {
  mediateurId: MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'),
  nom: 'Edith Piaf',
  email: 'edith@piaf.com',
  conseillerNumerique: true,
}

describe('rechercheTropCourte', () => {
  it('exige au moins 3 caractères hors espaces', () => {
    expect(rechercheTropCourte(' ed ')).toBe(true)
    expect(rechercheTropCourte('edi')).toBe(false)
  })

  it('le dit au coordinateur', () => {
    expect(optionsRechercheTropCourte()).toEqual([
      {
        label: 'La recherche doit contenir au moins 3 caractères',
        value: null,
        isDisabled: true,
      },
    ])
  })
})

describe('optionsDeRecherche', () => {
  it('annonce le nombre de résultats, propose les médiateurs puis la saisie libre', () => {
    expect(
      optionsDeRecherche('edith', { mediateurs: [mediateur], total: 1 }),
    ).toEqual([
      { label: '1 résultat', value: null, isDisabled: true },
      {
        label: 'Edith Piaf',
        value: {
          mediateurId: mediateur.mediateurId,
          email: 'edith@piaf.com',
          isConseillerNumerique: true,
        },
      },
      { label: 'edith', value: { email: 'edith', mediateurId: 'edith' } },
    ])
  })

  it('accorde zéro résultat au singulier', () => {
    expect(optionsDeRecherche('xyz', { mediateurs: [], total: 0 })[0]).toEqual({
      label: '0 résultat',
      value: null,
      isDisabled: true,
    })
  })

  it('signale les médiateurs au-delà de la page', () => {
    expect(
      optionsDeRecherche('edith', { mediateurs: [mediateur], total: 3 }).at(-1),
    ).toEqual({
      label:
        'Veuillez préciser votre recherche - 2 médiateurs ne sont pas affichés',
      value: null,
      isDisabled: true,
    })
  })

  it('signale une recherche indisponible en gardant la saisie libre', () => {
    expect(optionsDeRecherche('edith@piaf.com', null)).toEqual([
      {
        label: 'La recherche est indisponible, veuillez réessayer',
        value: null,
        isDisabled: true,
      },
      {
        label: 'edith@piaf.com',
        value: { email: 'edith@piaf.com', mediateurId: 'edith@piaf.com' },
      },
    ])
  })
})
