import {
  Adresse,
  CodeInsee,
  CodePostal,
  Contact,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  Localisation,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import type {
  DestinationDuLieu,
  LieuCandidatCoop,
} from '../../../domain/destination-du-lieu'
import type { Fiche } from '../../../domain/fiche'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../domain/lieu'
import { ModificationInconnue } from '../../../domain/registre/tracabilite'
import { creerLieuActivite } from './creer-lieu-activite'

const creeLe = new Date('2026-01-01T00:00:00Z')
const supprimeLe = new Date('2025-06-01T00:00:00Z')
const createur = UtilisateurId('3f2b8c1d-6e4a-4b9f-8d7c-2a1e5f0b9c34')
const mediateurId = MediateurId('9b2d5a3e-1f4c-4e8a-9d6b-3c7e2f1a8b40')
const EXISTANT = LieuId('7c9e6679-7425-40de-944b-e07fc1f90ae7')

const ficheSansAdresse: Fiche = {
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
}

const sansAdresse: Lieu = {
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
  fiche: ficheSansAdresse,
  visibilite: VisibiliteCartographie('NonPublie'),
  idsCartographieNationale: null,
  banId: null,
  identiteSirene: { nomUsage: null, synchronisation: null },
  tracabilite: {
    creation: { date: creeLe, par: createur },
    derniereModification: ModificationInconnue(creeLe),
    suppression: { _tag: 'Actif' },
  },
}

const auPort: Lieu = {
  ...sansAdresse,
  fiche: {
    ...ficheSansAdresse,
    adresse: Adresse({
      voie: '12 quai du Port',
      code_postal: '17300',
      code_insee: '17299',
      commune: 'Rochefort',
    }),
    localisation: Localisation({ latitude: 45.94, longitude: -0.96 }),
  },
}

const sansCodeInsee: Lieu = {
  ...sansAdresse,
  fiche: {
    ...ficheSansAdresse,
    adresse: Adresse({
      voie: '12 quai du Port',
      code_postal: '17300',
      commune: 'Rochefort',
    }),
  },
}

const annexeAuPort: Lieu = {
  ...auPort,
  fiche: { ...auPort.fiche, nom: Nom('Tiers-lieu du Port Annexe') },
}

const publieAuPort: Lieu = {
  ...auPort,
  visibilite: VisibiliteCartographie('Publie'),
}

const candidat = (suppression: Date | null): LieuCandidatCoop => ({
  id: EXISTANT,
  nom: 'Tiers-lieu du Port',
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: CodePostal('17300'),
  codeInsee: CodeInsee('17299'),
  latitude: 45.94,
  longitude: -0.96,
  suppression,
})

describe('créer un lieu d’activité', () => {
  it('refuse la création à qui n’est pas médiateur', async () => {
    expect(
      await creerLieuActivite({
        lieuxAuMemeEndroit: async () => [],
        enregistrer: async () => ({
          _tag: 'Enregistre',
          rattachement: 'Rattache',
        }),
      })({ lieu: auPort, mediateurId: null }),
    ).toEqual(failure({ _tag: 'MediateurRequis' }))
  })

  it.each<{
    cas: string
    candidats: readonly LieuCandidatCoop[]
    lieu: Lieu
    destination: DestinationDuLieu<Lieu>
  }>([
    {
      cas: 'crée le lieu saisi sans adresse',
      candidats: [candidat(null)],
      lieu: sansAdresse,
      destination: {
        _tag: 'LieuACreer',
        id: sansAdresse.id,
        creation: sansAdresse,
      },
    },
    {
      cas: 'crée le lieu saisi faute de code INSEE, sans chercher au même endroit',
      candidats: [candidat(null)],
      lieu: sansCodeInsee,
      destination: {
        _tag: 'LieuACreer',
        id: sansCodeInsee.id,
        creation: sansCodeInsee,
      },
    },
    {
      cas: 'crée le lieu saisi quand la coop ne connaît rien au même endroit',
      candidats: [],
      lieu: auPort,
      destination: { _tag: 'LieuACreer', id: auPort.id, creation: auPort },
    },
    {
      cas: 'rejoint le lieu actif de la coop qui désigne le même endroit',
      candidats: [candidat(null)],
      lieu: auPort,
      destination: { _tag: 'LieuActif', id: EXISTANT },
    },
    {
      cas: 'relève le lieu supprimé de dénomination identique',
      candidats: [candidat(supprimeLe)],
      lieu: auPort,
      destination: { _tag: 'LieuARelever', id: EXISTANT },
    },
    {
      cas: 'crée le lieu saisi quand le lieu supprimé n’a qu’une dénomination proche',
      candidats: [candidat(supprimeLe)],
      lieu: annexeAuPort,
      destination: {
        _tag: 'LieuACreer',
        id: annexeAuPort.id,
        creation: annexeAuPort,
      },
    },
  ])('$cas', async ({ candidats, lieu, destination }) => {
    expect(
      await creerLieuActivite({
        lieuxAuMemeEndroit: async () => candidats,
        enregistrer: async () => ({
          _tag: 'Enregistre',
          rattachement: 'Rattache',
        }),
      })({ lieu, mediateurId }),
    ).toEqual(
      success({
        destination,
        mediateurId,
        debut: creeLe,
        par: createur,
        ecritureAuRegistre: 'IdentiteSeule',
        rattachement: 'Rattache',
      }),
    )
  })

  it('écrit toute la fiche au registre quand le lieu créé est publié', async () => {
    expect(
      await creerLieuActivite({
        lieuxAuMemeEndroit: async () => [],
        enregistrer: async () => ({
          _tag: 'Enregistre',
          rattachement: 'Rattache',
        }),
      })({ lieu: publieAuPort, mediateurId }),
    ).toEqual(
      success({
        destination: {
          _tag: 'LieuACreer',
          id: publieAuPort.id,
          creation: publieAuPort,
        },
        mediateurId,
        debut: creeLe,
        par: createur,
        ecritureAuRegistre: 'FicheComplete',
        rattachement: 'Rattache',
      }),
    )
  })

  it('échoue sur le lieu rejoint qui a disparu avant l’enregistrement', async () => {
    expect(
      await creerLieuActivite({
        lieuxAuMemeEndroit: async () => [candidat(null)],
        enregistrer: async () => ({ _tag: 'LieuDisparu', lieuId: EXISTANT }),
      })({ lieu: auPort, mediateurId }),
    ).toEqual(failure({ _tag: 'LieuIntrouvable', lieuId: EXISTANT }))
  })

  it('rend compte du médiateur qui exerçait déjà dans le lieu rejoint', async () => {
    expect(
      await creerLieuActivite({
        lieuxAuMemeEndroit: async () => [candidat(null)],
        enregistrer: async () => ({
          _tag: 'Enregistre',
          rattachement: 'DejaRattache',
        }),
      })({ lieu: auPort, mediateurId }),
    ).toEqual(
      success({
        destination: { _tag: 'LieuActif', id: EXISTANT },
        mediateurId,
        debut: creeLe,
        par: createur,
        ecritureAuRegistre: 'IdentiteSeule',
        rattachement: 'DejaRattache',
      }),
    )
  })
})
