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
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { Lieu } from '../../../domain/lieu'
import { ModificationInconnue } from '../../../domain/registre/tracabilite'
import { creerLieuActivite } from './creer-lieu-activite'

const lieu: Lieu = {
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
  fiche: {
    nom: Nom('Tiers-lieu du Port'),
    pivot: null,
    adresse: null,
    localisation: null,
    typologies: Typologies([]),
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
  },
  visibilite: VisibiliteCartographie('NonPublie'),
  idsCartographieNationale: null,
  banId: null,
  identiteSirene: { nomUsage: null, synchronisation: null },
  tracabilite: {
    creation: { date: new Date('2026-01-01T00:00:00Z'), par: null },
    derniereModification: ModificationInconnue(
      new Date('2026-01-01T00:00:00Z'),
    ),
    suppression: { _tag: 'Actif' },
  },
}

const mediateurId = MediateurId('9b2d5a3e-1f4c-4e8a-9d6b-3c7e2f1a8b40')

const lieuEnregistre = LieuId('7c9e6679-7425-40de-944b-e07fc1f90ae7')

const creer = creerLieuActivite({ enregistrer: async () => lieuEnregistre })

describe('créer un lieu d’activité', () => {
  it('refuse la création à qui n’est pas médiateur', async () => {
    expect(await creer({ lieu, mediateurId: null })).toEqual({
      success: false,
      error: { _tag: 'MediateurRequis' },
    })
  })

  it('enregistre le lieu d’un médiateur', async () => {
    expect(await creer({ lieu, mediateurId })).toEqual({
      success: true,
      data: { id: lieuEnregistre, lieu, mediateurId },
    })
  })
})
