import {
  Contact,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  Typologie,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../domain/fiche'
import { IdsCartographieNationale } from '../../../domain/ids-cartographie-nationale'
import { SourceCartographie } from '../../../domain/tracabilite'
import { lieuDepuisCarto } from './lieu-carto'

const maintenant = new Date('2026-09-07T10:00:00Z')

const fiche: Fiche = {
  nom: Nom('Tiers-lieu du Port'),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: Typologies([Typologie.TIERS_LIEUX]),
  contact: Contact({}),
  horaires: null,
  presentation: null,
  services: Services([]),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([]),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques([]),
  modalitesAcces: ModalitesAcces([]),
  fraisACharge: FraisACharge([]),
  itinerance: Itinerances([]),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux([]),
  formationsLabels: FormationsLabels([]),
  autresFormationsLabels: [],
  modalitesAccompagnement: ModalitesAccompagnement([]),
  ficheAccesLibre: null,
  priseRdv: null,
}

const lieuCarto = {
  idsCartographieNationale: IdsCartographieNationale('dora__abc'),
  source: null,
  fiche,
}

describe('le lieu matérialisé depuis la cartographie', () => {
  it('est publié, et porte les identifiants sous lesquels la carto le connaît', () => {
    const lieu = lieuDepuisCarto(lieuCarto, maintenant)

    expect(lieu.visibilite).toBe('Publie')
    expect(lieu.idsCartographieNationale).toEqual(['dora', 'abc'])
  })

  it('n’a ni identifiant BAN ni identité SIRENE', () => {
    const lieu = lieuDepuisCarto(lieuCarto, maintenant)

    expect(lieu.banId).toBeNull()
    expect(lieu.identiteSirene).toEqual({
      nomUsage: null,
      synchronisation: null,
    })
  })

  it('est créé sans auteur', () => {
    expect(lieuDepuisCarto(lieuCarto, maintenant).tracabilite.creation).toEqual(
      {
        date: maintenant,
        par: null,
      },
    )
  })

  it('porte la signature du producteur qui l’a écrit en dernier', () => {
    const lieu = lieuDepuisCarto(
      { ...lieuCarto, source: SourceCartographie('dora') },
      maintenant,
    )

    expect(lieu.tracabilite.derniereModification).toEqual({
      _tag: 'ParSource',
      date: maintenant,
      source: 'dora',
    })
  })

  it('reste sans auteur quand aucun producteur n’est nommé', () => {
    expect(
      lieuDepuisCarto(lieuCarto, maintenant).tracabilite.derniereModification,
    ).toEqual({ _tag: 'Inconnue', date: maintenant })
  })
})
