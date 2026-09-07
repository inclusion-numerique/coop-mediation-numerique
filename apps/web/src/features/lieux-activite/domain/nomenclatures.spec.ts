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

  /**
   * Le schéma national en compte un de plus, auquel la base ne sait pas donner
   * de nom : le réafficher ferait disparaître le choix à l'enregistrement.
   */
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
  /**
   * Une source externe rend des chaînes ; les traiter d'emblée comme des
   * valeurs du standard demanderait un `as`, c'est-à-dire une affirmation
   * qu'on ne vérifie pas.
   */
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

  /** La comparaison porte sur la VALEUR du standard, pas sur le nom du membre. */
  it('ne reconnaît pas le nom d’un membre pris pour sa valeur', () => {
    expect(reconnues(Service, ['AideAuxDemarchesAdministratives'])).toEqual([])
  })

  /** Les sigles de typologie sont, eux, leur propre valeur. */
  it('reconnaît un sigle de typologie', () => {
    expect(reconnues(Typologie, ['ACI', 'RIEN'])).toEqual([Typologie.ACI])
  })

  it('rend une liste vide quand rien n’est proposé', () => {
    expect(reconnues(Service, [])).toEqual([])
  })
})
