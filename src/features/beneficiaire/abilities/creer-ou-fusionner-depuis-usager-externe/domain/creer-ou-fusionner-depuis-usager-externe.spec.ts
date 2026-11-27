import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { DuplicateBeneficiaire } from '@/features/beneficiaire/domain/doublon-de-beneficiaire'
import { Email } from '@/features/beneficiaire/domain/email'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { EchecTechnique, failure, success } from '@/libraries/result'
import { Telephone } from '@/libraries/telephone'
import { creerOuFusionnerDepuisUsagerExterne } from './creer-ou-fusionner-depuis-usager-externe'
import type { FusionDesUsagers } from './fusion-des-usagers'
import type { CreerOuFusionnerDepuisUsagerExternePorts } from './ports'
import type { MergedBeneficiaire, UsagerNormalise } from './usager-externe'

const maintenant = new Date('2026-06-15T12:00:00.000Z')

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')

const adresse = '12 rue de la Paix, 27000 Évreux'

const evreux = CommuneResidence({
  commune: 'Évreux',
  codePostal: '27000',
  codeInsee: '27229',
})

const communeDEvreux = {
  commune: 'Évreux',
  communeCodePostal: '27000',
  communeCodeInsee: '27229',
}

const annee1996 = AnneeNaissance(maintenant)(1996)

const usagerComplet: UsagerNormalise = {
  rdvUserId: 42,
  nom: Nom('Martin'),
  prenom: Prenom('Léa'),
  telephone: Telephone('0102030405'),
  email: Email('lea@example.fr'),
  adresse,
  anneeNaissance: annee1996,
}

const usagerSansDonnees: UsagerNormalise = {
  rdvUserId: 42,
  nom: null,
  prenom: null,
  telephone: null,
  email: null,
  adresse: null,
  anneeNaissance: null,
}

const lie: MergedBeneficiaire = {
  id: BeneficiaireId('1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f'),
  nom: null,
  prenom: null,
  email: null,
  telephone: null,
  mediateurId,
  adresse: null,
  anneeNaissance: null,
  commune: null,
}

const lieComplet: MergedBeneficiaire = {
  ...lie,
  nom: Nom('Martin'),
  prenom: Prenom('Léa'),
  email: Email('lea@example.fr'),
  telephone: Telephone('+33102030405'),
  anneeNaissance: AnneeNaissance(maintenant)(1990),
  commune: 'Évreux',
}

const ecrit: MergedBeneficiaire = {
  ...lie,
  id: BeneficiaireId('2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f60'),
}

const doublon: DuplicateBeneficiaire = {
  id: BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f'),
  nom: Nom('Martin'),
  prenom: Prenom('Léa'),
  telephone: null,
  email: null,
  creation: new Date('2025-01-05T08:00:00.000Z'),
  anneeNaissance: null,
  communeResidence: null,
}

const ports: CreerOuFusionnerDepuisUsagerExternePorts = {
  lireLeBeneficiaireLie: async () => success(null),
  trouverUnDoublon: async () => success(null),
  communeDeLAdresse: async () => success(evreux),
  mettreAJourLeBeneficiaire: async () => success(ecrit),
  creerLeBeneficiaire: async () => success(ecrit),
}

const panne = async () => failure(EchecTechnique('panne'))

const nouveauBeneficiaire = {
  rdvUserId: 42,
  nom: Nom('Martin'),
  prenom: Prenom('Léa'),
  telephone: Telephone('0102030405'),
  email: Email('lea@example.fr'),
  adresse,
  anneeNaissance: annee1996,
  trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
  commune: 'Évreux',
  communeCodePostal: '27000',
  communeCodeInsee: '27229',
  mediateurId,
}

describe('créer ou fusionner des bénéficiaires depuis des usagers externes', () => {
  it('crée un bénéficiaire identifié pour un usager inconnu, avec la commune de son adresse', async () => {
    expect(
      await creerOuFusionnerDepuisUsagerExterne(ports)({
        usagers: [usagerComplet],
        mediateurId,
        maintenant,
      }),
    ).toEqual(
      success<FusionDesUsagers>({
        merges: [ecrit],
        skipped: [],
        ecritures: [{ _tag: 'Creation', beneficiaire: nouveauBeneficiaire }],
      }),
    )
  })

  it('crée le bénéficiaire sans commune quand l’adresse n’en donne pas', async () => {
    expect(
      await creerOuFusionnerDepuisUsagerExterne({
        ...ports,
        communeDeLAdresse: async () => success(null),
      })({ usagers: [usagerComplet], mediateurId, maintenant }),
    ).toEqual(
      success<FusionDesUsagers>({
        merges: [ecrit],
        skipped: [],
        ecritures: [
          {
            _tag: 'Creation',
            beneficiaire: {
              ...nouveauBeneficiaire,
              commune: null,
              communeCodePostal: null,
              communeCodeInsee: null,
            },
          },
        ],
      }),
    )
  })

  it('crée le bénéficiaire sans année de naissance ni tranche d’âge quand l’usager n’en donne pas', async () => {
    expect(
      await creerOuFusionnerDepuisUsagerExterne(ports)({
        usagers: [
          {
            ...usagerSansDonnees,
            nom: Nom('Martin'),
            prenom: Prenom('Léa'),
          },
        ],
        mediateurId,
        maintenant,
      }),
    ).toEqual(
      success<FusionDesUsagers>({
        merges: [ecrit],
        skipped: [],
        ecritures: [
          {
            _tag: 'Creation',
            beneficiaire: {
              ...nouveauBeneficiaire,
              telephone: null,
              email: null,
              adresse: null,
              anneeNaissance: null,
              trancheAge: null,
              commune: null,
              communeCodePostal: null,
              communeCodeInsee: null,
            },
          },
        ],
      }),
    )
  })

  it.each<{ cas: string; usager: UsagerNormalise }>([
    { cas: 'nom', usager: { ...usagerComplet, nom: null } },
    { cas: 'prénom', usager: { ...usagerComplet, prenom: null } },
  ])(
    'écarte un usager inconnu sans $cas, illisible une fois créé',
    async ({ usager }) => {
      expect(
        await creerOuFusionnerDepuisUsagerExterne(ports)({
          usagers: [usager],
          mediateurId,
          maintenant,
        }),
      ).toEqual(
        success<FusionDesUsagers>({
          merges: [],
          skipped: [
            {
              rdvUserId: 42,
              reason: { _tag: 'IdentiteIncomplete', rdvUserId: 42 },
            },
          ],
          ecritures: [],
        }),
      )
    },
  )

  it('rend tel quel le bénéficiaire déjà lié quand l’usager n’apporte rien', async () => {
    expect(
      await creerOuFusionnerDepuisUsagerExterne({
        ...ports,
        lireLeBeneficiaireLie: async () => success(lie),
      })({ usagers: [usagerSansDonnees], mediateurId, maintenant }),
    ).toEqual(
      success<FusionDesUsagers>({ merges: [lie], skipped: [], ecritures: [] }),
    )
  })

  it('complète le bénéficiaire déjà lié de ce qui lui manque, commune comprise', async () => {
    expect(
      await creerOuFusionnerDepuisUsagerExterne({
        ...ports,
        lireLeBeneficiaireLie: async () => success(lie),
      })({ usagers: [usagerComplet], mediateurId, maintenant }),
    ).toEqual(
      success<FusionDesUsagers>({
        merges: [ecrit],
        skipped: [],
        ecritures: [
          {
            _tag: 'MiseAJour',
            id: lie.id,
            mediateurId,
            donnees: {
              email: Email('lea@example.fr'),
              telephone: Telephone('0102030405'),
              prenom: Prenom('Léa'),
              nom: Nom('Martin'),
              adresse,
              anneeNaissance: annee1996,
              trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
              ...communeDEvreux,
            },
          },
        ],
      }),
    )
  })

  it('ne remplace pas les valeurs connues du bénéficiaire déjà lié, mais recopie l’adresse', async () => {
    expect(
      await creerOuFusionnerDepuisUsagerExterne({
        ...ports,
        lireLeBeneficiaireLie: async () => success(lieComplet),
      })({ usagers: [usagerComplet], mediateurId, maintenant }),
    ).toEqual(
      success<FusionDesUsagers>({
        merges: [ecrit],
        skipped: [],
        ecritures: [
          {
            _tag: 'MiseAJour',
            id: lie.id,
            mediateurId,
            donnees: { adresse },
          },
        ],
      }),
    )
  })

  it('lie le doublon trouvé à l’usager et le complète de ce qui lui manque', async () => {
    expect(
      await creerOuFusionnerDepuisUsagerExterne({
        ...ports,
        trouverUnDoublon: async () => success(doublon),
      })({ usagers: [usagerComplet], mediateurId, maintenant }),
    ).toEqual(
      success<FusionDesUsagers>({
        merges: [ecrit],
        skipped: [],
        ecritures: [
          {
            _tag: 'MiseAJour',
            id: doublon.id,
            mediateurId,
            donnees: {
              rdvUserId: 42,
              email: Email('lea@example.fr'),
              telephone: Telephone('0102030405'),
              adresse,
              anneeNaissance: annee1996,
              trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
              ...communeDEvreux,
            },
          },
        ],
      }),
    )
  })

  it('ne touche ni l’adresse ni la commune d’un doublon dont la résidence est connue', async () => {
    expect(
      await creerOuFusionnerDepuisUsagerExterne({
        ...ports,
        trouverUnDoublon: async () =>
          success({
            ...doublon,
            communeResidence: evreux,
          }),
      })({ usagers: [usagerComplet], mediateurId, maintenant }),
    ).toEqual(
      success<FusionDesUsagers>({
        merges: [ecrit],
        skipped: [],
        ecritures: [
          {
            _tag: 'MiseAJour',
            id: doublon.id,
            mediateurId,
            donnees: {
              rdvUserId: 42,
              email: Email('lea@example.fr'),
              telephone: Telephone('0102030405'),
              anneeNaissance: annee1996,
              trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
            },
          },
        ],
      }),
    )
  })

  it.each<{ cas: string; ports: CreerOuFusionnerDepuisUsagerExternePorts }>([
    {
      cas: 'la lecture du bénéficiaire lié',
      ports: { ...ports, lireLeBeneficiaireLie: panne },
    },
    {
      cas: 'la recherche d’un doublon',
      ports: { ...ports, trouverUnDoublon: panne },
    },
    {
      cas: 'la commune de l’adresse d’un usager inconnu',
      ports: { ...ports, communeDeLAdresse: panne },
    },
    {
      cas: 'la commune de l’adresse d’un usager déjà lié',
      ports: {
        ...ports,
        lireLeBeneficiaireLie: async () => success(lie),
        communeDeLAdresse: panne,
      },
    },
    {
      cas: 'la commune de l’adresse d’un doublon',
      ports: {
        ...ports,
        trouverUnDoublon: async () => success(doublon),
        communeDeLAdresse: panne,
      },
    },
    {
      cas: 'la mise à jour du bénéficiaire',
      ports: {
        ...ports,
        lireLeBeneficiaireLie: async () => success(lie),
        mettreAJourLeBeneficiaire: panne,
      },
    },
    {
      cas: 'la création du bénéficiaire',
      ports: { ...ports, creerLeBeneficiaire: panne },
    },
  ])('écarte l’usager quand $cas échoue', async ({ ports }) => {
    expect(
      await creerOuFusionnerDepuisUsagerExterne(ports)({
        usagers: [usagerComplet],
        mediateurId,
        maintenant,
      }),
    ).toEqual(
      success<FusionDesUsagers>({
        merges: [],
        skipped: [
          {
            rdvUserId: 42,
            reason: { _tag: 'EchecTechnique', cause: 'panne' },
          },
        ],
        ecritures: [],
      }),
    )
  })
})
