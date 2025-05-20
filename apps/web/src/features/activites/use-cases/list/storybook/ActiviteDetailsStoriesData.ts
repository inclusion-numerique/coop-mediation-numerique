import { createBeneficiairesForParticipantsAnonymes } from '../../../../../beneficiaire/createBeneficiairesForParticipantsAnonymes'
import { participantsAnonymesDefault } from '../../cra/collectif/validation/participantsAnonymes'
import { ActiviteForList } from '../db/activitesQueries'

export const activiteIndividuelleInfosMinimum = {
  type: 'Individuel',
  id: '1',
  mediateurId: '2',
  creation: new Date('2024-03-22'),
  modification: new Date('2024-03-22'),
  date: new Date('2024-03-22'),
  duree: 90,
  thematiques: [
    'CreerAvecLeNumerique',
    'PrendreEnMainDuMateriel',
    'InsertionProfessionnelle',
  ],
  notes: null,
  accompagnements: [
    {
      premierAccompagnement: false,
      beneficiaire: {
        id: '2',
        anonyme: true,
        attributionsAleatoires: false,
        prenom: null,
        nom: null,
        commune: null,
        communeCodePostal: null,
        statutSocial: null,
        genre: null,
        trancheAge: null,
        _count: {
          accompagnements: 5,
        },
      },
    },
  ],
  typeLieu: 'LieuActivite',
  autonomie: null,
  materiel: [],
  lieuCommune: null,
  lieuCodeInsee: null,
  lieuCodePostal: null,
  structure: {
    id: '1',
    nom: 'Bibliotheque Musee de l’Opera, au fond du couloir à droite',
    commune: 'Paris',
    codePostal: '75006',
  },
  orienteVersStructure: null,
  structureDeRedirection: null,
  precisionsDemarche: null,
  titreAtelier: null,
  niveau: null,
} satisfies ActiviteForList

export const activiteIndividuelleBeneficiaireSuivi = {
  type: 'Individuel',
  id: '1',
  mediateurId: '2',
  creation: new Date('2024-03-22'),
  modification: new Date('2024-03-22'),
  date: new Date('2024-03-22'),
  duree: 120,
  thematiques: ['NavigationSurInternet', 'Email'],
  notes: null,
  accompagnements: [
    {
      premierAccompagnement: false,
      beneficiaire: {
        id: '2',
        anonyme: false,
        attributionsAleatoires: false,
        prenom: 'Jean',
        nom: 'Dupont',
        commune: null,
        communeCodePostal: null,
        statutSocial: 'EnEmploi',
        genre: 'Masculin',
        trancheAge: 'NonCommunique',
        _count: {
          accompagnements: 5,
        },
      },
    },
  ],
  typeLieu: 'ADistance',
  autonomie: null,
  materiel: [],
  lieuCommune: null,
  lieuCodeInsee: null,
  lieuCodePostal: null,
  structure: null,
  orienteVersStructure: true,
  structureDeRedirection: 'OperateurOuOrganismeEnCharge',
  precisionsDemarche: null,
  titreAtelier: null,
  niveau: null,
} satisfies ActiviteForList

// Refactored "Individuel" type activity with an anonymous beneficiary
export const activiteIndividuelleBeneficiaireAnonyme = {
  type: 'Individuel',
  id: '1',
  mediateurId: '2',
  creation: new Date('2024-03-22'),
  modification: new Date('2024-03-22'),
  date: new Date('2024-03-22'),
  duree: 120,
  thematiques: ['NavigationSurInternet', 'Email'],
  notes:
    '<p>Lörem ipsum ladeniliga douche <strong>plaledes</strong>. Nining son. Mipära kavun joskap juling lanar. Segyde snålsurfa då jevis. Dorade preng posad. Spefuv ter i kvasitiskap då mobilblottare dir. Häbel epihet i tegt. Ultrar. Digt hän. Polytt doskapet tempopatologi. Use betårta, tena. Biktiga pojuren.</p><p>Segyde snålsurfa då jevis. <strong>Dorade preng posad</strong>. Spefuv ter i kvasitiskap då mobilblottare dir. Häbel epihet i tegt. Ultrar. Digt hän. Polytt doskapet tempopatologi. Use betårta, tena. Biktiga pojuren</p>',
  accompagnements: [
    {
      premierAccompagnement: false,
      beneficiaire: {
        id: '2',
        anonyme: true,
        attributionsAleatoires: false,
        prenom: null,
        nom: null,
        commune: 'Lyon',
        communeCodePostal: '69002',
        statutSocial: 'EnEmploi',
        genre: 'Masculin',
        trancheAge: 'QuaranteCinquanteNeuf',
        _count: {
          accompagnements: 0,
        },
      },
    },
  ],
  typeLieu: 'Domicile',
  autonomie: null,
  materiel: [],
  lieuCommune: 'Lyon',
  lieuCodeInsee: '69382',
  lieuCodePostal: '69002',
  structure: null,
  orienteVersStructure: true,
  structureDeRedirection: 'OperateurOuOrganismeEnCharge',
  precisionsDemarche: null,
  titreAtelier: null,
  niveau: null,
} satisfies ActiviteForList

// Refactored "Collectif" type activity with minimal information
export const activiteCollectifInfosRepliees = {
  type: 'Collectif',
  id: '1',
  mediateurId: '2',
  creation: new Date('2024-03-22'),
  modification: new Date('2024-03-22'),
  date: new Date('2024-03-22'),
  duree: 120,
  thematiques: ['NavigationSurInternet', 'Email'],
  notes:
    '<p>Lörem ipsum ladeniliga douche <strong>plaledes</strong>. Nining son. Mipära kavun joskap juling lanar. Segyde snålsurfa då jevis. Dorade preng posad. Spefuv ter i kvasitiskap då mobilblottare dir. Häbel epihet i tegt. Ultrar. Digt hän. Polytt doskapet tempopatologi. Use betårta, tena. Biktiga pojuren.</p><p>Segyde snålsurfa då jevis. <strong>Dorade preng posad</strong>. Spefuv ter i kvasitiskap då mobilblottare dir. Häbel epihet i tegt. Ultrar. Digt hän. Polytt doskapet tempopatologi. Use betårta, tena. Biktiga pojuren</p>',
  accompagnements: [
    {
      premierAccompagnement: false,
      beneficiaire: {
        id: '3',
        anonyme: false,
        attributionsAleatoires: false,
        prenom: 'Marie',
        nom: 'Durand',
        genre: null,
        trancheAge: null,
        statutSocial: null,
        commune: null,
        communeCodePostal: null,
        _count: {
          accompagnements: 1,
        },
      },
    },
    {
      premierAccompagnement: false,
      beneficiaire: {
        id: '2',
        anonyme: false,
        attributionsAleatoires: false,
        prenom: 'Jean',
        nom: 'Dupont',
        genre: null,
        trancheAge: null,
        statutSocial: null,
        commune: null,
        communeCodePostal: null,
        _count: {
          accompagnements: 1,
        },
      },
    },
  ],
  typeLieu: 'Autre',
  autonomie: null,
  materiel: [],
  lieuCommune: 'Lyon',
  lieuCodeInsee: '69382',
  lieuCodePostal: '69002',
  structure: null,
  orienteVersStructure: null,
  structureDeRedirection: null,
  precisionsDemarche: null,
  titreAtelier: 'Atelier de découverte de la vacuité de toute chose',
  niveau: 'Debutant',
} satisfies ActiviteForList

// Refactored "Collectif" type activity with expanded information
export const activiteCollectifInfosDepliees = {
  type: 'Collectif',
  id: '1',
  mediateurId: '2',
  creation: new Date('2024-07-22'),
  modification: new Date('2024-07-22'),
  date: new Date('2024-07-22'),
  duree: 120,
  thematiques: ['NavigationSurInternet', 'Email'],
  notes: null,
  accompagnements: [
    ...createBeneficiairesForParticipantsAnonymes({
      mediateurId: '2',
      participantsAnonymes: {
        ...participantsAnonymesDefault,
        total: 40,
        genreFeminin: 15,
        genreMasculin: 2,
        genreNonCommunique: 23,
        trancheAgeVingtCinqTrenteNeuf: 40,
        statutSocialNonCommunique: 40,
      },
    }).map(
      (beneficiaire, index): ActiviteForList['accompagnements'][number] => ({
        premierAccompagnement: false,
        beneficiaire: {
          ...beneficiaire,
          id: `3${index.toString()}`,
          prenom: null,
          nom: null,
          commune: null,
          communeCodePostal: null,
          _count: {
            accompagnements: 1,
          },
        },
      }),
    ),
    {
      premierAccompagnement: false,
      beneficiaire: {
        id: '3',
        anonyme: false,
        attributionsAleatoires: false,
        prenom: 'Marie',
        nom: 'Durand',
        genre: null,
        trancheAge: null,
        statutSocial: null,
        commune: null,
        communeCodePostal: null,
        _count: {
          accompagnements: 1,
        },
      },
    },
    {
      premierAccompagnement: false,
      beneficiaire: {
        id: '2',
        anonyme: false,
        attributionsAleatoires: false,
        prenom: 'Jean',
        nom: 'Dupont',
        genre: null,
        trancheAge: null,
        statutSocial: null,
        commune: null,
        communeCodePostal: null,
        _count: {
          accompagnements: 1,
        },
      },
    },
  ],

  typeLieu: 'LieuActivite',
  autonomie: null,
  materiel: [],
  lieuCommune: null,
  lieuCodeInsee: null,
  lieuCodePostal: null,
  structure: {
    id: '1',
    nom: 'Bibliotheque Musee de l’Opera, au fond du couloir à droite',
    commune: 'Paris',
    codePostal: '75006',
  },
  orienteVersStructure: null,
  structureDeRedirection: null,
  precisionsDemarche: null,
  titreAtelier: null,
  niveau: 'Debutant',
} satisfies ActiviteForList

export const activitesForModalStories = [
  activiteIndividuelleInfosMinimum,
  activiteIndividuelleBeneficiaireSuivi,
  activiteIndividuelleBeneficiaireAnonyme,
  activiteCollectifInfosRepliees,
  activiteCollectifInfosDepliees,
]
