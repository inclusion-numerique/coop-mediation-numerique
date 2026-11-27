import { describe, expect, it } from 'vitest'
import {
  type ActionDecidee,
  AdresseCourriel,
  type CompteARelancer,
  type CoordinateurId,
  MediateurId,
  Prenom,
  Relance,
  rattachements,
  SuppressionRefusee,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { EchecTechnique, failure, success } from '@/libraries/result'
import type { RelancerLesInscritsInactifsPorts } from './ports'
import { relancerLesInscritsInactifs } from './relancer-les-inscrits-inactifs'

const maintenant = new Date('2026-10-21T00:00:00.000Z')
const UN_JOUR = 24 * 60 * 60 * 1000

const ilYA = (jours: number): Date =>
  new Date(maintenant.getTime() - jours * UN_JOUR)

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')

const compte = (
  jours: number,
  relance: Relance,
  suppressionAnnoncee: Date | null,
  aProduit: boolean,
): CompteARelancer => ({
  utilisateurId,
  courriel: AdresseCourriel('jeanne.martin@example.com'),
  prenom: Prenom('Jeanne'),
  rattachements: rattachements<MediateurId, CoordinateurId>(
    MediateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809'),
    null,
  ),
  situation: {
    phase: 'Nouveau',
    depuis: ilYA(jours),
    relance,
    suppressionAnnoncee,
    aProduit,
  },
})

const aEffacer = compte(106, Relance('AvertissementJ90'), ilYA(1), false)

const ports = (
  comptes: readonly CompteARelancer[],
): RelancerLesInscritsInactifsPorts => ({
  lireLesComptesARelancer: async () => comptes,
  envoyerBienDemarrer: async () => success(undefined),
  envoyerLaRelanceDuCompte: async () => success(undefined),
  envoyerLAvertissement: async () => success(undefined),
  envoyerLAvisDEffacement: async () => success(undefined),
  supprimerLeCompte: async () => success({ id: utilisateurId }),
  noterLaRelance: async () => success(undefined),
})

const relancer = (portsDeLaRelance: RelancerLesInscritsInactifsPorts) =>
  relancerLesInscritsInactifs(portsDeLaRelance)({ maintenant })

describe('relancer les inscrits inactifs', () => {
  it.each<{ cas: string; compteLu: CompteARelancer; action: ActionDecidee }>([
    {
      cas: 'relance à J+7 un inscrit jamais relancé',
      compteLu: compte(8, Relance('Aucune'), null, false),
      action: { _tag: 'Relancer', palier: 7 },
    },
    {
      cas: 'relance à J+30 un inscrit ancien jamais relancé',
      compteLu: compte(40, Relance('Aucune'), null, false),
      action: { _tag: 'Relancer', palier: 30 },
    },
    {
      cas: 'relance à J+60 un inscrit relancé à J+30',
      compteLu: compte(61, Relance('J30'), null, false),
      action: { _tag: 'Relancer', palier: 60 },
    },
    {
      cas: 'avertit un inscrit inactif depuis 90 jours',
      compteLu: compte(91, Relance('J60'), null, false),
      action: {
        _tag: 'Avertir',
        suppressionLe: new Date('2026-11-04T00:00:00.000Z'),
        joursRestants: 14,
      },
    },
    {
      cas: 'repart de zéro avec un inscrit revenu depuis moins d’une semaine',
      compteLu: compte(3, Relance('J7'), null, false),
      action: { _tag: 'Reinitialiser' },
    },
    {
      cas: 'supprime un inscrit dont la suppression annoncée est échue',
      compteLu: aEffacer,
      action: { _tag: 'Effacer' },
    },
  ])('$cas', async ({ compteLu, action }) => {
    expect(await relancer(ports([compteLu]))).toEqual(
      success([{ utilisateurId, action, issue: 'fait' }]),
    )
  })

  it('ne relance jamais un inscrit qui a produit', async () => {
    expect(
      await relancer(
        ports([compte(106, Relance('AvertissementJ90'), ilYA(1), true)]),
      ),
    ).toEqual(success([]))
  })

  it('rapporte une suppression refusée avec son motif', async () => {
    expect(
      await relancer({
        ...ports([aEffacer]),
        supprimerLeCompte: async () =>
          failure(SuppressionRefusee('RoleProtege')),
      }),
    ).toEqual(
      success([
        {
          utilisateurId,
          action: { _tag: 'Effacer' },
          issue: 'echec',
          cause: 'RoleProtege',
        },
      ]),
    )
  })

  it('rapporte l’échec de l’avis de suppression avec sa cause', async () => {
    expect(
      await relancer({
        ...ports([aEffacer]),
        envoyerLAvisDEffacement: async () =>
          failure(EchecTechnique('SMTP indisponible')),
      }),
    ).toEqual(
      success([
        {
          utilisateurId,
          action: { _tag: 'Effacer' },
          issue: 'echec',
          cause: 'SMTP indisponible',
        },
      ]),
    )
  })

  it.each<{
    cas: string
    compteLu: CompteARelancer
    defaillant: Partial<RelancerLesInscritsInactifsPorts>
    palier: 7 | 30 | 60
  }>([
    {
      cas: 'le gabarit Bien démarrer à J+7',
      compteLu: compte(8, Relance('Aucune'), null, false),
      defaillant: {
        envoyerLaRelanceDuCompte: async () =>
          failure(EchecTechnique('mauvais gabarit')),
      },
      palier: 7,
    },
    {
      cas: 'la relance du compte à J+30',
      compteLu: compte(40, Relance('Aucune'), null, false),
      defaillant: {
        envoyerBienDemarrer: async () =>
          failure(EchecTechnique('mauvais gabarit')),
      },
      palier: 30,
    },
  ])('envoie $cas', async ({ compteLu, defaillant, palier }) => {
    expect(await relancer({ ...ports([compteLu]), ...defaillant })).toEqual(
      success([
        {
          utilisateurId,
          action: { _tag: 'Relancer', palier },
          issue: 'fait',
        },
      ]),
    )
  })
})
