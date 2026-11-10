import {
  type AccompagnementIndividuel,
  type ActiviteDeMediation,
  ActiviteId,
  type AtelierCollectif,
  Autonomie,
  aucuneParticipationAnonyme,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  Effectif,
  EmployeuseId,
  Genre,
  IdentifiantCraV1,
  LieuActiviteId,
  Materiel,
  MediateurId,
  NiveauDAtelier,
  Notes,
  PrecisionDeDemarche,
  participantsAnonymesDe,
  RdvId,
  StatutSocial,
  StructureDeRedirection,
  TagId,
  ThematiqueAdministrative,
  ThematiqueDeMediation,
  TitreDAtelier,
  TrancheDAge,
} from '../domain'
import {
  type ActiviteDeMediationRow,
  ActiviteIllisible,
  activiteDeMediationFromDomain,
  activiteDeMediationToDomain,
} from './activite-de-mediation.transfer'

const instant = new Date('2026-11-10T09:00:00.000Z')

const nouvelId = (): string => crypto.randomUUID()

const allerRetour = (activite: ActiviteDeMediation): ActiviteDeMediation =>
  activiteDeMediationToDomain(activiteDeMediationFromDomain(activite, nouvelId))

const lyon = Commune({
  nom: 'Lyon',
  codePostal: '69001',
  codeInsee: '69123',
})

const ajaccio = Commune({
  nom: 'Ajaccio',
  codePostal: '20000',
  codeInsee: '2A004',
})

const individuelMinimal: AccompagnementIndividuel = {
  _tag: 'Individuel',
  id: ActiviteId('b0000000-0000-4000-8000-000000000001'),
  mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
  date: DateDActivite('2026-11-10'),
  duree: DureeEnMinutes(45),
  lieu: {
    _tag: 'LieuActivite',
    lieuActiviteId: LieuActiviteId('d0000000-0000-4000-8000-000000000001'),
  },
  thematiques: {
    mediation: [ThematiqueDeMediation('Email')],
    demarche: null,
  },
  equipement: { _tag: 'NonRenseigne' },
  tags: [],
  notes: null,
  origine: { _tag: 'Saisie' },
  employeuse: null,
  creation: instant,
  modification: instant,
  beneficiaire: {
    _tag: 'Suivi',
    id: BeneficiaireId('e0000000-0000-4000-8000-000000000001'),
  },
  autonomie: null,
  orientation: { _tag: 'NonRenseignee' },
}

const individuelComplet: AccompagnementIndividuel = {
  ...individuelMinimal,
  lieu: { _tag: 'Domicile', commune: lyon },
  thematiques: {
    mediation: [
      ThematiqueDeMediation('Email'),
      ThematiqueDeMediation('SecuriteNumerique'),
    ],
    demarche: {
      thematiques: [
        ThematiqueAdministrative('Logement'),
        ThematiqueAdministrative('ArgentImpots'),
        ThematiqueAdministrative('Justice'),
      ],
      precision: PrecisionDeDemarche('Demande d’APL'),
    },
  },
  equipement: {
    _tag: 'Materiels',
    materiels: [
      Materiel('Ordinateur'),
      Materiel('Telephone'),
      Materiel('Tablette'),
      Materiel('Autre'),
    ],
  },
  tags: [
    TagId('f0000000-0000-4000-8000-000000000001'),
    TagId('f0000000-0000-4000-8000-000000000002'),
  ],
  notes: Notes('<p>Prochain rendez-vous dans un mois</p>'),
  origine: { _tag: 'RendezVous', rdvId: RdvId(4242) },
  employeuse: EmployeuseId(17),
  beneficiaire: {
    _tag: 'Anonyme',
    dejaAccompagne: true,
    profil: {
      genre: Genre('Feminin'),
      trancheDAge: TrancheDAge('SoixanteDixPlus'),
      statutSocial: StatutSocial('Retraite'),
      residence: ajaccio,
    },
  },
  autonomie: Autonomie('PartiellementAutonome'),
  orientation: {
    _tag: 'Oriente',
    vers: StructureDeRedirection('Administration'),
  },
}

const anonymesDe = (
  saisie: Parameters<typeof participantsAnonymesDe>[0],
): AtelierCollectif['participants']['anonymes'] => {
  const resultat = participantsAnonymesDe(saisie)
  if (!resultat.success) {
    throw new Error(resultat.error._tag)
  }
  return resultat.data
}

const {
  beneficiaire: _beneficiaire,
  autonomie: _autonomie,
  orientation: _orientation,
  ...commun
} = individuelMinimal

const atelier: AtelierCollectif = {
  ...commun,
  _tag: 'Collectif',
  titre: TitreDAtelier('Découvrir sa messagerie'),
  niveau: NiveauDAtelier('Debutant'),
  participants: {
    suivis: [
      BeneficiaireId('e0000000-0000-4000-8000-000000000001'),
      BeneficiaireId('e0000000-0000-4000-8000-000000000002'),
    ],
    anonymes: anonymesDe({
      ...aucuneParticipationAnonyme,
      total: Effectif(3),
      dejaAccompagnes: Effectif(1),
      genres: { masculin: Effectif(1), feminin: Effectif(1) },
      tranchesDAge: {
        ...aucuneParticipationAnonyme.tranchesDAge,
        soixanteDixPlus: Effectif(2),
      },
      statutsSociaux: {
        ...aucuneParticipationAnonyme.statutsSociaux,
        retraite: Effectif(3),
      },
    }),
  },
}

describe('transfer de l’activité de médiation', () => {
  it.each<[string, ActiviteDeMediation]>([
    ['un accompagnement individuel minimal', individuelMinimal],
    ['un accompagnement individuel complet', individuelComplet],
    [
      'un accompagnement à un autre endroit',
      { ...individuelMinimal, lieu: { _tag: 'Autre', commune: lyon } },
    ],
    [
      'un accompagnement à distance rattaché à une commune',
      {
        ...individuelMinimal,
        lieu: { _tag: 'ADistance', communeDeRattachement: lyon },
      },
    ],
    [
      'un accompagnement à distance sans commune de rattachement',
      {
        ...individuelMinimal,
        lieu: { _tag: 'ADistance', communeDeRattachement: null },
      },
    ],
    [
      'une personne non orientée',
      { ...individuelMinimal, orientation: { _tag: 'NonOriente' } },
    ],
    [
      'une personne orientée sans structure précisée',
      { ...individuelMinimal, orientation: { _tag: 'Oriente', vers: null } },
    ],
    [
      'une absence de matériel',
      { ...individuelMinimal, equipement: { _tag: 'AucunMateriel' } },
    ],
    [
      'l’aide aux démarches seule',
      {
        ...individuelMinimal,
        thematiques: {
          mediation: [],
          demarche: { thematiques: [], precision: null },
        },
      },
    ],
    [
      'un anonyme sans profil',
      {
        ...individuelMinimal,
        beneficiaire: {
          _tag: 'Anonyme',
          dejaAccompagne: false,
          profil: {
            genre: Genre('NonCommunique'),
            trancheDAge: TrancheDAge('NonCommunique'),
            statutSocial: StatutSocial('NonCommunique'),
            residence: null,
          },
        },
      },
    ],
    [
      'une activité importée de la V1',
      {
        ...individuelMinimal,
        origine: { _tag: 'ImportV1', identifiant: IdentifiantCraV1('cra-v1') },
      },
    ],
    ['un atelier mixte', atelier],
    [
      'un atelier de bénéficiaires suivis seulement',
      {
        ...atelier,
        titre: null,
        niveau: null,
        participants: {
          ...atelier.participants,
          anonymes: anonymesDe(aucuneParticipationAnonyme),
        },
      },
    ],
    [
      'un atelier d’anonymes seulement',
      { ...atelier, participants: { ...atelier.participants, suivis: [] } },
    ],
    [
      'un atelier de 10 000 anonymes',
      {
        ...atelier,
        participants: {
          suivis: [],
          anonymes: anonymesDe({
            ...aucuneParticipationAnonyme,
            total: Effectif(10_000),
          }),
        },
      },
    ],
  ])('relit %s à l’identique', (_, activite) => {
    expect(allerRetour(activite)).toEqual(activite)
  })

  it('stocke « non communiqué » comme une absence', () => {
    const [anonyme] = activiteDeMediationFromDomain(
      {
        ...individuelMinimal,
        beneficiaire: {
          _tag: 'Anonyme',
          dejaAccompagne: false,
          profil: {
            genre: Genre('NonCommunique'),
            trancheDAge: TrancheDAge('NonCommunique'),
            statutSocial: StatutSocial('NonCommunique'),
            residence: null,
          },
        },
      },
      nouvelId,
    ).accompagnements

    expect(anonyme?.beneficiaire).toMatchObject({
      genre: null,
      trancheAge: null,
      statutSocial: null,
    })
  })

  it('efface les champs d’atelier d’un accompagnement individuel', () => {
    expect(
      activiteDeMediationFromDomain(individuelMinimal, nouvelId),
    ).toMatchObject({ titreAtelier: null, niveau: null })
  })

  describe('lecture stricte', () => {
    const ligne = (
      modification: Partial<ActiviteDeMediationRow>,
    ): ActiviteDeMediationRow => ({
      ...activiteDeMediationFromDomain(individuelMinimal, nouvelId),
      ...modification,
    })

    it('lit une chaîne vide comme une absence', () => {
      expect(
        activiteDeMediationToDomain(
          ligne({
            typeLieu: 'ADistance',
            structureId: null,
            lieuCommune: '',
            lieuCodePostal: '',
            lieuCodeInsee: null,
          }),
        ).lieu,
      ).toEqual({ _tag: 'ADistance', communeDeRattachement: null })
    })

    it('relit une activité importée de la V1 sans thématique', () => {
      expect(
        activiteDeMediationToDomain(
          ligne({ thematiques: [], v1CraId: 'cra-v1' }),
        ).thematiques,
      ).toEqual({ mediation: [], demarche: null })
    })

    it('relit un atelier historique sans participant', () => {
      const atelierVide = activiteDeMediationToDomain({
        ...activiteDeMediationFromDomain(atelier, nouvelId),
        accompagnements: [],
      })
      expect(
        atelierVide._tag === 'Collectif' && atelierVide.participants.suivis,
      ).toEqual([])
    })

    it('lit une note vide en texte riche comme une absence', () => {
      expect(
        activiteDeMediationToDomain(ligne({ notes: '<p></p>' })).notes,
      ).toBeNull()
    })

    it.each<[string, Partial<ActiviteDeMediationRow>]>([
      [
        'une commune incomplète',
        {
          typeLieu: 'Domicile',
          structureId: null,
          lieuCommune: 'Lyon',
          lieuCodePostal: '',
          lieuCodeInsee: '69123',
        },
      ],
      [
        'une thématique administrative sans aide aux démarches',
        { thematiques: ['Logement'] },
      ],
      ['un individuel avec un titre d’atelier', { titreAtelier: 'Atelier' }],
      [
        'une redirection sans orientation',
        { structureDeRedirection: 'Administration' },
      ],
      ['un matériel en plus de « aucun »', { materiel: ['Aucun', 'Tablette'] }],
      ['un individuel sans bénéficiaire', { accompagnements: [] }],
      ['une saisie sans thématique', { thematiques: [] }],
    ])('refuse %s', (_, modification) => {
      expect(() => activiteDeMediationToDomain(ligne(modification))).toThrow(
        ActiviteIllisible,
      )
    })

    it('refuse un code INSEE mal formé', () => {
      expect(() =>
        activiteDeMediationToDomain(
          ligne({
            typeLieu: 'Domicile',
            structureId: null,
            lieuCommune: 'Castellet-lès-Sausses',
            lieuCodePostal: '04320',
            lieuCodeInsee: '4173',
          }),
        ),
      ).toThrow()
    })
  })
})
