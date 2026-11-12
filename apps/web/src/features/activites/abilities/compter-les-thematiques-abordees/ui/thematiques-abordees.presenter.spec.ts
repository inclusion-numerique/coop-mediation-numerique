import { Effectif, ThematiqueRecherchee } from '../../../domain'
import { thematiquesAbordeesPresentees } from './thematiques-abordees.presenter'

describe('thématiques abordées avec un bénéficiaire', () => {
  it('les libelle et les range par ordre alphabétique de libellé', () => {
    expect(
      thematiquesAbordeesPresentees([
        {
          thematique: ThematiqueRecherchee('AideAuxDemarchesAdministratives'),
          nombre: Effectif(2),
        },
        { thematique: ThematiqueRecherchee('Email'), nombre: Effectif(1) },
        { thematique: ThematiqueRecherchee('Logement'), nombre: Effectif(3) },
        {
          thematique: ThematiqueRecherchee('CultureNumerique'),
          nombre: Effectif(1),
        },
      ]),
    ).toEqual([
      {
        thematique: 'AideAuxDemarchesAdministratives',
        libelle: 'Aide aux démarches administratives',
        nombre: 2,
      },
      {
        thematique: 'CultureNumerique',
        libelle: 'Culture numérique',
        nombre: 1,
      },
      { thematique: 'Email', libelle: 'E-mail', nombre: 1 },
      { thematique: 'Logement', libelle: 'Logement', nombre: 3 },
    ])
  })
})
