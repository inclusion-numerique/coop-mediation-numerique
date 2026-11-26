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
import { LieuId } from '../../../domain/identifiants/lieu-id'
import type { Lieu } from '../../../domain/lieu'
import { ModificationInconnue } from '../../../domain/registre/tracabilite'
import type { ModificationLieu } from './modification-lieu'
import { laisseUnePublicationSansService } from './publication-sans-service'

const publieSansService: Lieu = {
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
  visibilite: VisibiliteCartographie('Publie'),
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

const publieAvecService: Lieu = {
  ...publieSansService,
  fiche: {
    ...publieSansService.fiche,
    services: Services([Service.AideAuxDemarchesAdministratives]),
  },
}

const nonPublieSansService: Lieu = {
  ...publieSansService,
  visibilite: VisibiliteCartographie('NonPublie'),
}

const servicesRetires: ModificationLieu = {
  section: 'ServicesEtAccompagnement',
  services: Services([]),
  modalitesAccompagnement: ModalitesAccompagnement([]),
}

const servicesConserves: ModificationLieu = {
  section: 'ServicesEtAccompagnement',
  services: Services([Service.AideAuxDemarchesAdministratives]),
  modalitesAccompagnement: ModalitesAccompagnement([]),
}

const description: ModificationLieu = {
  section: 'Description',
  presentation: null,
  formationsLabels: FormationsLabels([]),
}

describe('publication d’un lieu sans service', () => {
  it.each<{
    cas: string
    lieu: Lieu
    modification: ModificationLieu
    attendu: boolean
  }>([
    {
      cas: 'refuse de retirer tous les services d’un lieu publié',
      lieu: publieSansService,
      modification: servicesRetires,
      attendu: true,
    },
    {
      cas: 'accepte un lieu publié qui garde un service',
      lieu: publieAvecService,
      modification: servicesConserves,
      attendu: false,
    },
    {
      cas: 'laisse sans service un lieu qui n’est pas publié',
      lieu: nonPublieSansService,
      modification: servicesRetires,
      attendu: false,
    },
    {
      cas: 'ne vérifie pas les services quand une autre section est modifiée',
      lieu: publieSansService,
      modification: description,
      attendu: false,
    },
  ])('$cas', ({ lieu, modification, attendu }) => {
    expect(laisseUnePublicationSansService(lieu, modification)).toBe(attendu)
  })
})
