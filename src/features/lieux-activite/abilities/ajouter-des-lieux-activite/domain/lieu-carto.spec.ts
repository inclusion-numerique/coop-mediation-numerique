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
import { describe, expect, it } from 'vitest'
import { IdsCartographieNationale } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import type { Fiche } from '../../../domain/fiche'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { SourceCartographie } from '../../../domain/registre/tracabilite'
import { lieuDepuisCarto } from './lieu-carto'

const maintenant = new Date('2026-09-07T10:00:00Z')
const LIEU_ID = LieuId('550e8400-e29b-41d4-a716-446655440099')

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
  it('est publié', () => {
    expect(lieuDepuisCarto(lieuCarto, maintenant, LIEU_ID).visibilite).toBe(
      'Publie',
    )
  })

  it('porte les identifiants sous lesquels la carto le connaît', () => {
    expect(
      lieuDepuisCarto(lieuCarto, maintenant, LIEU_ID).idsCartographieNationale,
    ).toEqual(['dora', 'abc'])
  })

  it('n’a pas d’identifiant BAN', () => {
    expect(lieuDepuisCarto(lieuCarto, maintenant, LIEU_ID).banId).toBeNull()
  })

  it('n’a pas d’identité SIRENE', () => {
    expect(
      lieuDepuisCarto(lieuCarto, maintenant, LIEU_ID).identiteSirene,
    ).toEqual({
      nomUsage: null,
      synchronisation: null,
    })
  })

  it('est créé sans auteur', () => {
    expect(
      lieuDepuisCarto(lieuCarto, maintenant, LIEU_ID).tracabilite.creation,
    ).toEqual({
      date: maintenant,
      par: null,
    })
  })

  it('porte la signature du producteur qui l’a écrit en dernier', () => {
    const lieu = lieuDepuisCarto(
      { ...lieuCarto, source: SourceCartographie('dora') },
      maintenant,
      LIEU_ID,
    )

    expect(lieu.tracabilite.derniereModification).toEqual({
      _tag: 'ParSource',
      date: maintenant,
      source: 'dora',
    })
  })

  it('reste sans auteur quand aucun producteur n’est nommé', () => {
    expect(
      lieuDepuisCarto(lieuCarto, maintenant, LIEU_ID).tracabilite
        .derniereModification,
    ).toEqual({ _tag: 'Inconnue', date: maintenant })
  })
})
