import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  type Animation,
  CoordinateurId,
  DateDActivite,
  DureeEnMinutes,
  EchelonTerritorial,
  Effectif,
  type Evenement,
  Initiative,
  NatureDePartenariat,
  NomDeLActivite,
  NomDeStructure,
  NomDeTag,
  Notes,
  Organisateur,
  type Partenariat,
  Precision,
  TagId,
  ThematiqueDAnimation,
  TypeDEvenement,
  TypeDeStructurePartenaire,
} from '../../../domain'
import { EnregistrerUneActiviteDeCoordinationValidation } from '../action/enregistrer-une-activite-de-coordination.validation'
import { CraAnimationValidation } from './animation/validation/CraAnimationValidation'
import { CraEvenementValidation } from './evenement/validation/CraEvenementValidation'
import {
  formulaireDeLAnimation,
  formulaireDeLEvenement,
  formulaireDuPartenariat,
} from './formulaire-de-la-coordination.presenter'
import { CraPartenariatValidation } from './partenariat/validation/CraPartenariatValidation'
import {
  saisieDeLAnimation,
  saisieDeLEvenement,
  saisieDuPartenariat,
} from './saisie-du-formulaire.presenter'

const instant = new Date('2026-11-10T09:00:00.000Z')

const commun = {
  id: ActiviteDeCoordinationId('b0000000-0000-4000-8000-000000000001'),
  coordinateurId: CoordinateurId('c0000000-0000-4000-8000-000000000001'),
  date: DateDActivite('2026-11-10'),
  tags: [
    {
      id: TagId('f0000000-0000-4000-8000-000000000001'),
      nom: NomDeTag('Réseau'),
    },
  ],
  notes: Notes('<p>Bilan</p>'),
  creation: instant,
  modification: instant,
}

const animation: Animation = {
  ...commun,
  _tag: 'Animation',
  duree: DureeEnMinutes(90),
  typeDAnimation: { _tag: 'Autre', precision: Precision('Séminaire') },
  thematiques: {
    valeurs: [ThematiqueDAnimation('Reseau')],
    autre: Precision('Achats groupés'),
  },
  initiative: Initiative('Demande'),
  intervenants: {
    mediateurs: Effectif(3),
    structures: Effectif(1),
    autresActeurs: Effectif(0),
  },
}

const evenement: Evenement = {
  ...commun,
  _tag: 'Evenement',
  nom: NomDeLActivite('Forum'),
  typeDEvenement: { _tag: 'Liste', valeur: TypeDEvenement('NecLocal') },
  organisateurs: {
    valeurs: [Organisateur('Commune')],
    autre: Precision('Médiathèque'),
  },
  echelon: EchelonTerritorial('Departemental'),
  participants: Effectif(40),
}

const partenariat: Partenariat = {
  ...commun,
  _tag: 'Partenariat',
  nom: null,
  natures: { valeurs: [NatureDePartenariat('RDVElu')], autre: null },
  structuresPartenaires: [
    {
      nom: NomDeStructure('Mairie'),
      type: { _tag: 'Liste', valeur: TypeDeStructurePartenaire('Commune') },
    },
    {
      nom: NomDeStructure('Collectif'),
      type: { _tag: 'Autre', precision: Precision('Collectif citoyen') },
    },
  ],
  echelon: null,
}

const sansIdentite = ({
  coordinateurId: _coordinateurId,
  tags,
  creation: _creation,
  modification: _modification,
  ...saisie
}: ActiviteDeCoordination) => ({ ...saisie, tags: tags.map(({ id }) => id) })

describe('formulaire d’une activité de coordination', () => {
  it('rouvre une animation et la réenregistre à l’identique', () => {
    const saisie = EnregistrerUneActiviteDeCoordinationValidation.parse(
      saisieDeLAnimation(
        CraAnimationValidation.parse(formulaireDeLAnimation(animation)),
      ),
    )
    expect(saisie).toEqual(sansIdentite(animation))
  })

  it('rouvre un évènement et le réenregistre à l’identique', () => {
    const saisie = EnregistrerUneActiviteDeCoordinationValidation.parse(
      saisieDeLEvenement(
        CraEvenementValidation.parse(formulaireDeLEvenement(evenement)),
      ),
    )
    expect(saisie).toEqual(sansIdentite(evenement))
  })

  it('rouvre un partenariat et le réenregistre à l’identique', () => {
    const saisie = EnregistrerUneActiviteDeCoordinationValidation.parse(
      saisieDuPartenariat(
        CraPartenariatValidation.parse(formulaireDuPartenariat(partenariat)),
      ),
    )
    expect(saisie).toEqual(sansIdentite(partenariat))
  })
})
