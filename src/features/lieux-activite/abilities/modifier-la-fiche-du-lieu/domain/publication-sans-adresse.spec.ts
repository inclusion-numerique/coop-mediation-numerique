import {
  Adresse,
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
  Service,
  Services,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import { BanId } from '../../../domain/identifiants/ban-id'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import type { Lieu } from '../../../domain/lieu'
import { ModificationInconnue } from '../../../domain/registre/tracabilite'
import type { ModificationLieu } from './modification-lieu'
import { laisseUnePublicationSansAdresse } from './publication-sans-adresse'

const sansAdresseChoisie: Lieu = {
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
  fiche: {
    nom: Nom('Espace numérique'),
    pivot: null,
    adresse: Adresse({
      voie: '12 rue de la Paix',
      commune: 'Reims',
      code_postal: '51100',
    }),
    localisation: null,
    typologies: Typologies([]),
    contact: Contact({}),
    horaires: null,
    presentation: null,
    services: Services([Service.AideAuxDemarchesAdministratives]),
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

const avecAdresseChoisie: Lieu = {
  ...sansAdresseChoisie,
  banId: BanId('51454_1234_00012'),
}

const publication: ModificationLieu = {
  section: 'VisibiliteCartographie',
  visibilite: VisibiliteCartographie('Publie'),
}

const retrait: ModificationLieu = {
  section: 'VisibiliteCartographie',
  visibilite: VisibiliteCartographie('NonPublie'),
}

const description: ModificationLieu = {
  section: 'Description',
  presentation: null,
  formationsLabels: FormationsLabels([]),
}

describe('publication d’un lieu sans adresse choisie', () => {
  it.each<{
    cas: string
    lieu: Lieu
    modification: ModificationLieu
    attendu: boolean
  }>([
    {
      cas: 'refuse de publier un lieu dont l’adresse n’a pas été choisie',
      lieu: {
        ...sansAdresseChoisie,
        visibilite: VisibiliteCartographie('Publie'),
      },
      modification: publication,
      attendu: true,
    },
    {
      cas: 'publie un lieu dont l’adresse a été choisie',
      lieu: {
        ...avecAdresseChoisie,
        visibilite: VisibiliteCartographie('Publie'),
      },
      modification: publication,
      attendu: false,
    },
    {
      cas: 'laisse retirer de la carte un lieu sans adresse choisie',
      lieu: sansAdresseChoisie,
      modification: retrait,
      attendu: false,
    },
    {
      cas: 'ne vérifie pas l’adresse quand une autre section est modifiée',
      lieu: {
        ...sansAdresseChoisie,
        visibilite: VisibiliteCartographie('Publie'),
      },
      modification: description,
      attendu: false,
    },
  ])('$cas', ({ lieu, modification, attendu }) => {
    expect(laisseUnePublicationSansAdresse(lieu, modification)).toBe(attendu)
  })
})
