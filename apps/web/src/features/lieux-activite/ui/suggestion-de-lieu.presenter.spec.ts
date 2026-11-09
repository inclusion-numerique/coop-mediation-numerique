import {
  Nom,
  Siret,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { IdentifiantCartographie } from '../domain/ids-cartographie-nationale'
import { LieuId } from '../domain/lieu-id'
import { NombreDeLieux } from '../domain/nombres'
import {
  AdresseLibre,
  type SuggestionDeLieu,
} from '../domain/suggestion-de-lieu'
import {
  suggestionAffichee,
  suggestionsAffichees,
} from './suggestion-de-lieu.presenter'

const LIEU = LieuId('550e8400-e29b-41d4-a716-446655440000')

const suggestion: SuggestionDeLieu = {
  provenance: { _tag: 'Coop', lieuId: LIEU },
  nom: Nom('Tiers-lieu du Port'),
  adresse: AdresseLibre({
    voie: '12 quai du Port',
    commune: 'Rochefort',
    codePostal: '17300',
    codeInsee: '17299',
    complement: 'Bâtiment B',
  }),
  siret: Siret('13002603200016'),
  typologies: [Typologie.TIERS_LIEUX, Typologie.ASSO],
}

describe('une suggestion de lieu à l’écran', () => {
  it('désigne un lieu de la coop par son identifiant et le rattache', () => {
    expect(suggestionAffichee(suggestion)).toEqual({
      id: `structure_${LIEU}`,
      nom: 'Tiers-lieu du Port',
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
      complementAdresse: 'Bâtiment B',
      pivot: '13002603200016',
      typologie: `${Typologie.TIERS_LIEUX};${Typologie.ASSO}`,
      structures: [{ id: LIEU }],
      source: 'structure_locale',
    })
  })

  it('désigne un lieu de la cartographie par son identifiant cartographique', () => {
    expect(
      suggestionAffichee({
        ...suggestion,
        provenance: {
          _tag: 'Cartographie',
          identifiant: IdentifiantCartographie('carto-1'),
          lieuCoop: null,
        },
        siret: null,
        typologies: [],
      }),
    ).toMatchObject({
      id: 'carto-1',
      structures: [],
      source: 'cartographie_nationale',
      pivot: undefined,
      typologie: null,
    })
  })

  it('désigne un établissement de l’annuaire par son SIRET', () => {
    expect(
      suggestionAffichee({
        ...suggestion,
        provenance: { _tag: 'Annuaire', siret: Siret('13002603200016') },
      }),
    ).toMatchObject({ id: 'api_13002603200016', source: 'api', structures: [] })
  })

  it('compte ce que la liste n’affiche pas', () => {
    expect(
      suggestionsAffichees({
        suggestions: [suggestion],
        nombre: NombreDeLieux(12),
        annuaireIndisponible: false,
        cartographieIndisponible: true,
      }),
    ).toMatchObject({
      matchesCount: 12,
      moreResults: 11,
      apiUnavailable: false,
      cartoUnavailable: true,
    })
  })
})
