import { participantsAnonymesDefault } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/participants-anonymes.form-data'
import {
  craCollectif,
  craDeDemarcheAdministrative,
  craIndividuel,
} from '@/features/activites/fixtures/cra'
import { Thematique } from '@/generated/prisma/browser'

export type ReferencesDesCras = {
  readonly mediateurs: {
    readonly mediateurAvecActivite: string
    readonly conseillerNumerique: string
    readonly coordinateurInscritAvecTout: string
  }
  readonly beneficiaires: {
    readonly minimaleMediateurAvecActivite: string
    readonly maximaleMediateurAvecActivite: string
    readonly anonymeMediateurAvecActivite: string
    readonly minimaleConseillerNumerique: string
    readonly maximaleConseillerNumerique: string
    readonly anonymeConseillerNumerique: string
    readonly minimaleCoordinateur: string
    readonly maximaleCoordinateur: string
  }
  readonly lieux: {
    readonly mediateque: { readonly id: string }
  }
}

const mediateurAvecActiviteCrasIndividuels = (
  references: ReferencesDesCras,
) => [
  craIndividuel({
    id: 'bcb0ad21-5be2-417a-9ff2-d8b4dd9c62b0',
    beneficiaireId: references.beneficiaires.minimaleMediateurAvecActivite,
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [Thematique.Sante, Thematique.CultureNumerique],
    date: new Date('2024-06-15'),
    creation: new Date('2024-06-15T09:30:00'),
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craIndividuel({
    id: 'f005e2ec-b974-4ccb-a09a-ea17382dc1de',
    beneficiaireId: references.beneficiaires.minimaleMediateurAvecActivite,
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [Thematique.InsertionProfessionnelle, Thematique.Sante],
    date: new Date('2024-08-02'),
    creation: new Date('2024-08-02T19:00:00'),
    typeLieu: 'Domicile',
    lieuCodePostal: '75001',
    lieuCodeInsee: '75101',
    lieuCommune: 'Paris 1er',
    materiel: ['Ordinateur', 'Telephone', 'Autre'],
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craIndividuel({
    id: 'b0f901a3-38b0-4c30-89b8-ace056801ca2',
    beneficiaireId: references.beneficiaires.maximaleMediateurAvecActivite,
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [Thematique.Email, Thematique.Parentalite],
    date: new Date('2024-07-28'),
    creation: new Date('2024-07-28T10:00:00'),
    typeLieu: 'ADistance',
    materiel: ['Ordinateur', 'Telephone', 'Tablette', 'Autre'],
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craIndividuel({
    id: 'b72eb129-86e7-4cda-8238-5a57c79999a1',
    beneficiaireId: references.beneficiaires.maximaleMediateurAvecActivite,
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [Thematique.Email],
    date: new Date('2024-07-28'),
    creation: new Date('2024-07-28T09:00:00'),
    typeLieu: 'Domicile',
    lieuCodePostal: '75001',
    lieuCodeInsee: '75101',
    lieuCommune: 'Paris 1er',
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
]

const mediateurAvecActiviteCrasDemarchesAdministratives = (
  references: ReferencesDesCras,
) => [
  craDeDemarcheAdministrative({
    id: '1c083c39-beec-4606-ba1a-f1cdf173e5d4',
    beneficiaireId: references.beneficiaires.minimaleMediateurAvecActivite,
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [
      Thematique.AideAuxDemarchesAdministratives,
      Thematique.SocialSante,
      Thematique.EtrangersEurope,
    ],
    date: new Date('2024-08-02'),
    creation: new Date('2024-08-02T14:00:00'),
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craDeDemarcheAdministrative({
    id: '42b5be6b-5140-48e3-9c56-af7b6dda04f0',
    beneficiaireId: references.beneficiaires.maximaleMediateurAvecActivite,
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [
      Thematique.AideAuxDemarchesAdministratives,
      Thematique.SocialSante,
      Thematique.Logement,
    ],
    date: new Date('2024-08-03'),
    creation: new Date('2024-08-03T15:00:00'),
    typeLieu: 'LieuActivite',
    structureId: references.lieux.mediateque.id,
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craDeDemarcheAdministrative({
    id: 'c96812d9-cbfe-4260-9430-77f9befd22aa',
    beneficiaireId: references.beneficiaires.anonymeMediateurAvecActivite,
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [
      Thematique.AideAuxDemarchesAdministratives,
      Thematique.FamilleScolarite,
      Thematique.TransportsMobilite,
    ],
    date: new Date('2024-08-05'),
    creation: new Date('2024-08-05T15:30:00'),
    lieuCommune: 'Lyon 2eme',
    lieuCodePostal: '69002',
    lieuCodeInsee: '69382',
    structureId: null,
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craDeDemarcheAdministrative({
    id: '36e41a5c-95ad-405d-8b59-8be586017924',
    beneficiaireId: references.beneficiaires.maximaleMediateurAvecActivite,
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [
      Thematique.AideAuxDemarchesAdministratives,
      Thematique.SocialSante,
      Thematique.Justice,
    ],
    date: new Date('2024-08-03'),
    creation: new Date('2024-08-03T16:00:00'),
    typeLieu: 'LieuActivite',
    structureId: references.lieux.mediateque.id,
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
]

const mediateurAvecActiviteCrasCollectifs = (references: ReferencesDesCras) => [
  craCollectif({
    id: '1b5d4e97-de3d-4e6d-87f2-b1ab28c6af5e',
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [Thematique.Email, Thematique.ReseauxSociaux],
    date: new Date('2024-08-04'),
    creation: new Date('2024-08-04T08:00:00'),
    beneficiaireIds: [
      references.beneficiaires.minimaleMediateurAvecActivite,
      references.beneficiaires.maximaleMediateurAvecActivite,
    ],
    participantsAnonymes: participantsAnonymesDefault,
    materiel: ['Ordinateur', 'Tablette', 'Autre'],
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craCollectif({
    id: 'ae49f9d3-f7ee-454b-b54b-f4683757cb70',
    mediateurId: references.mediateurs.mediateurAvecActivite,
    thematiques: [Thematique.ReseauxSociaux, Thematique.CultureNumerique],
    date: new Date('2024-07-05'),
    creation: new Date('2024-07-05T09:00:00'),
    titreAtelier:
      'Conduites à risque sur internet et les bons usages du numérique',
    beneficiaireIds: [
      references.beneficiaires.minimaleMediateurAvecActivite,
      references.beneficiaires.maximaleMediateurAvecActivite,
    ],
    participantsAnonymes: {
      ...participantsAnonymesDefault,
      total: 10,
      genreNonCommunique: 10,
      statutSocialEnEmploi: 8,
      statutSocialScolarise: 2,
      trancheAgeVingtCinqTrenteNeuf: 3,
      trancheAgeQuaranteCinquanteNeuf: 5,
      trancheAgeNonCommunique: 2,
    },
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
]

const conseillerNumeriqueCrasIndividuels = (references: ReferencesDesCras) => [
  craIndividuel({
    id: 'fa05c7eb-a4a5-4b90-bc59-8c83eea045ea',
    beneficiaireId: references.beneficiaires.minimaleConseillerNumerique,
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [Thematique.Sante, Thematique.CultureNumerique],
    date: new Date('2024-06-15'),
    creation: new Date('2024-06-15T09:30:00'),
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craIndividuel({
    id: 'f8ffef47-ef81-46fa-a5c3-49f8aadef935',
    beneficiaireId: references.beneficiaires.minimaleConseillerNumerique,
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [Thematique.InsertionProfessionnelle, Thematique.Sante],
    date: new Date('2024-08-02'),
    creation: new Date('2024-08-02T19:00:00'),
    typeLieu: 'Domicile',
    lieuCodePostal: '75001',
    lieuCodeInsee: '75101',
    lieuCommune: 'Paris 1er',
    materiel: ['Ordinateur', 'Telephone', 'Tablette'],
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craIndividuel({
    id: '4edab41b-f924-431f-b59e-def20528d1ef',
    beneficiaireId: references.beneficiaires.maximaleConseillerNumerique,
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [Thematique.Email, Thematique.Parentalite],
    date: new Date('2024-07-28'),
    creation: new Date('2024-07-28T10:00:00'),
    typeLieu: 'ADistance',
    materiel: ['Ordinateur', 'Telephone', 'Tablette', 'Autre'],
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craIndividuel({
    id: 'a0e12e9c-46c7-4f83-86bd-824d18113bf6',
    beneficiaireId: references.beneficiaires.maximaleConseillerNumerique,
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [Thematique.Email, Thematique.Sante],
    date: new Date('2024-07-28'),
    creation: new Date('2024-07-28T09:00:00'),
    typeLieu: 'Domicile',
    lieuCodePostal: '75001',
    lieuCodeInsee: '75101',
    lieuCommune: 'Paris 1er',
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
]

const conseillerNumeriqueCrasDemarchesAdministratives = (
  references: ReferencesDesCras,
) => [
  craDeDemarcheAdministrative({
    id: '26c0e764-1959-4ff5-b447-fd086e9120a7',
    beneficiaireId: references.beneficiaires.minimaleConseillerNumerique,
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [
      Thematique.AideAuxDemarchesAdministratives,
      Thematique.SocialSante,
      Thematique.EtrangersEurope,
    ],
    date: new Date('2024-08-02'),
    creation: new Date('2024-08-02T14:00:00'),
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craDeDemarcheAdministrative({
    id: 'bd477c86-9222-4997-bc7c-f109f401ccd8',
    beneficiaireId: references.beneficiaires.maximaleConseillerNumerique,
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [
      Thematique.AideAuxDemarchesAdministratives,
      Thematique.SocialSante,
      Thematique.Logement,
    ],
    date: new Date('2024-08-03'),
    creation: new Date('2024-08-03T15:00:00'),
    typeLieu: 'LieuActivite',
    structureId: references.lieux.mediateque.id,
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craDeDemarcheAdministrative({
    id: '863d8cda-e020-4379-b222-5ae468ce6b4b',
    beneficiaireId: references.beneficiaires.anonymeConseillerNumerique,
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [
      Thematique.AideAuxDemarchesAdministratives,
      Thematique.FamilleScolarite,
      Thematique.TransportsMobilite,
    ],
    date: new Date('2024-08-05'),
    creation: new Date('2024-08-05T15:30:00'),
    lieuCommune: 'Lyon 2eme',
    lieuCodePostal: '69002',
    lieuCodeInsee: '69382',
    structureId: null,
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craDeDemarcheAdministrative({
    id: '3c91bec2-8828-4f52-801a-d9be09c2ae80',
    beneficiaireId: references.beneficiaires.maximaleConseillerNumerique,
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [
      Thematique.AideAuxDemarchesAdministratives,
      Thematique.SocialSante,
      Thematique.Justice,
    ],
    date: new Date('2024-08-03'),
    creation: new Date('2024-08-03T16:00:00'),
    typeLieu: 'LieuActivite',
    structureId: references.lieux.mediateque.id,
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
]

const conseillerNumeriqueCrasCollectifs = (references: ReferencesDesCras) => [
  craCollectif({
    id: 'c9740386-4257-489d-b431-d63e2f6570de',
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [Thematique.Email, Thematique.ReseauxSociaux],
    date: new Date('2024-08-04'),
    creation: new Date('2024-08-04T08:00:00'),
    beneficiaireIds: [
      references.beneficiaires.minimaleConseillerNumerique,
      references.beneficiaires.maximaleConseillerNumerique,
    ],
    participantsAnonymes: participantsAnonymesDefault,
    materiel: ['Ordinateur', 'Tablette', 'Autre'],
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
  craCollectif({
    id: '608de160-f16d-41af-a388-024ba4a79493',
    mediateurId: references.mediateurs.conseillerNumerique,
    thematiques: [Thematique.ReseauxSociaux, Thematique.CultureNumerique],
    date: new Date('2024-07-05'),
    creation: new Date('2024-07-05T09:00:00'),
    titreAtelier:
      'Conduites à risque sur internet et les bons usages du numérique',
    beneficiaireIds: [
      references.beneficiaires.minimaleConseillerNumerique,
      references.beneficiaires.maximaleConseillerNumerique,
    ],
    participantsAnonymes: {
      ...participantsAnonymesDefault,
      total: 10,
      genreNonCommunique: 10,
      statutSocialEnEmploi: 8,
      statutSocialScolarise: 2,
      trancheAgeVingtCinqTrenteNeuf: 3,
      trancheAgeQuaranteCinquanteNeuf: 5,
      trancheAgeNonCommunique: 2,
    },
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
]

const coordinateurCrasIndividuels = (references: ReferencesDesCras) => [
  craIndividuel({
    id: '4ffd3052-bb5d-4289-897e-45aac4333af2',
    beneficiaireId: references.beneficiaires.minimaleCoordinateur,
    mediateurId: references.mediateurs.coordinateurInscritAvecTout,
    thematiques: [Thematique.Sante, Thematique.CultureNumerique],
    date: new Date('2024-06-15'),
    creation: new Date('2024-06-15T09:30:00'),
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
]

const coordinateurCrasDemarchesAdministratives = (
  references: ReferencesDesCras,
) => [
  craDeDemarcheAdministrative({
    id: 'd250af76-6ad2-4407-87a4-840ad6e593ed',
    beneficiaireId: references.beneficiaires.minimaleCoordinateur,
    mediateurId: references.mediateurs.coordinateurInscritAvecTout,
    thematiques: [
      Thematique.AideAuxDemarchesAdministratives,
      Thematique.SocialSante,
      Thematique.EtrangersEurope,
    ],
    date: new Date('2024-08-02'),
    creation: new Date('2024-08-02T14:00:00'),
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
]

const coordinateurCrasCollectifs = (references: ReferencesDesCras) => [
  craCollectif({
    id: '99098367-7fa3-4d82-9ac4-3aa1e87878d0',
    mediateurId: references.mediateurs.coordinateurInscritAvecTout,
    thematiques: [Thematique.Email, Thematique.ReseauxSociaux],
    date: new Date('2024-08-04'),
    creation: new Date('2024-08-04T08:00:00'),
    beneficiaireIds: [
      references.beneficiaires.minimaleCoordinateur,
      references.beneficiaires.maximaleCoordinateur,
    ],
    participantsAnonymes: participantsAnonymesDefault,
    materiel: ['Ordinateur', 'Tablette', 'Autre'],
    structureEmployeuseId: references.lieux.mediateque.id,
  }),
]

export const crasDeDemonstration = (references: ReferencesDesCras) => ({
  crasIndividuels: [
    ...mediateurAvecActiviteCrasIndividuels(references),
    ...conseillerNumeriqueCrasIndividuels(references),
    ...coordinateurCrasIndividuels(references),
  ],
  crasDemarchesAdministratives: [
    ...mediateurAvecActiviteCrasDemarchesAdministratives(references),
    ...conseillerNumeriqueCrasDemarchesAdministratives(references),
    ...coordinateurCrasDemarchesAdministratives(references),
  ],
  crasCollectifs: [
    ...mediateurAvecActiviteCrasCollectifs(references),
    ...conseillerNumeriqueCrasCollectifs(references),
    ...coordinateurCrasCollectifs(references),
  ],
})

export type CrasDeDemonstration = ReturnType<typeof crasDeDemonstration>
