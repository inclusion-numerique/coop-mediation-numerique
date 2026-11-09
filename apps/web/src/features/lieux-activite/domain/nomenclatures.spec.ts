import {
  FormationLabel,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  FormationLabelPropose,
  formationsLabelsProposees,
  reconnues,
} from './nomenclatures'

describe('les labels de formation que la coop sait enregistrer', () => {
  it('retient ceux que le formulaire propose', () => {
    expect(
      formationsLabelsProposees([
        FormationLabel.FabriquesDeTerritoire,
        FormationLabel.Ordi3,
      ]),
    ).toEqual([
      FormationLabelPropose.FabriquesDeTerritoire,
      FormationLabelPropose.Ordi3,
    ])
  })

  it('écarte celui que la base ne sait pas nommer', () => {
    expect(
      formationsLabelsProposees([
        FormationLabel.EtapesNumeriques,
        FormationLabel.MesPapiers,
      ]),
    ).toEqual([FormationLabelPropose.MesPapiers])
  })

  it('rend une liste vide pour une fiche sans label', () => {
    expect(formationsLabelsProposees([])).toEqual([])
  })
})

describe('les valeurs reconnues parmi des libellés bruts', () => {
  it('retient les libellés que l’énumération connaît, dans l’ordre', () => {
    expect(
      reconnues(Service, [
        'Aide aux démarches administratives',
        'Acquisition de matériel informatique à prix solidaire',
      ]),
    ).toEqual([
      Service.AideAuxDemarchesAdministratives,
      Service.MaterielInformatiqueAPrixSolidaire,
    ])
  })

  it('écarte ce qu’elle ne connaît pas', () => {
    expect(
      reconnues(Service, [
        'Aide aux démarches administratives',
        'Café-croissant',
      ]),
    ).toEqual([Service.AideAuxDemarchesAdministratives])
  })

  it('ne reconnaît pas le nom d’un membre pris pour sa valeur', () => {
    expect(reconnues(Service, ['AideAuxDemarchesAdministratives'])).toEqual([])
  })

  it('reconnaît un sigle de typologie', () => {
    expect(reconnues(Typologie, ['ACI', 'RIEN'])).toEqual([Typologie.ACI])
  })

  it('rend une liste vide quand rien n’est proposé', () => {
    expect(reconnues(Service, [])).toEqual([])
  })
})
