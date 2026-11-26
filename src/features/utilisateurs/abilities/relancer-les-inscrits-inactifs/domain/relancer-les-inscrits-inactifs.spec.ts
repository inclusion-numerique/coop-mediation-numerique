import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  type CompteARelancer,
  type CoordinateurId,
  MediateurId,
  Prenom,
  Relance,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, success } from '@/libraries/result'
import type { RelancerLesInscritsInactifsPorts } from './ports'
import { relancerLesInscritsInactifs } from './relancer-les-inscrits-inactifs'

const maintenant = new Date('2026-10-21T00:00:00.000Z')

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')

const compte = (
  depuis: string,
  relance: Relance,
  suppressionAnnoncee: Date | null,
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
    depuis: new Date(depuis),
    relance,
    suppressionAnnoncee,
    aProduit: false,
  },
})

const aEffacer = compte(
  '2026-07-07T00:00:00.000Z',
  Relance('AvertissementJ90'),
  new Date('2026-10-20T00:00:00.000Z'),
)

const ports = (
  comptes: readonly CompteARelancer[],
): RelancerLesInscritsInactifsPorts => ({
  lireLesComptesARelancer: async () => comptes,
  envoyerLaRelance: async () => undefined,
  envoyerLAvertissement: async () => undefined,
  envoyerLAvisDEffacement: async () => undefined,
  supprimerLeCompte: async () => success(undefined),
  noterLaRelance: async () => undefined,
})

describe('relancer les inscrits inactifs', () => {
  it.each<{ cas: string; compteARelancer: CompteARelancer; action: string }>([
    {
      cas: 'avertit un inscrit inactif depuis 90 jours',
      compteARelancer: compte('2026-07-21T00:00:00.000Z', Relance('J60'), null),
      action: 'Avertir',
    },
    {
      cas: 'repart de zéro avec un inscrit revenu depuis moins d’une semaine',
      compteARelancer: compte('2026-10-18T00:00:00.000Z', Relance('J7'), null),
      action: 'Reinitialiser',
    },
    {
      cas: 'supprime un inscrit dont la suppression annoncée est échue',
      compteARelancer: aEffacer,
      action: 'Effacer',
    },
  ])('$cas', async ({ compteARelancer, action }) => {
    expect(
      await relancerLesInscritsInactifs({
        maintenant,
        ports: ports([compteARelancer]),
      }),
    ).toEqual([{ utilisateurId, action, issue: 'fait' }])
  })

  it('rapporte une suppression refusée avec sa cause', async () => {
    expect(
      await relancerLesInscritsInactifs({
        maintenant,
        ports: {
          ...ports([aEffacer]),
          supprimerLeCompte: async () => failure({ _tag: 'RoleProtege' }),
        },
      }),
    ).toEqual([
      {
        utilisateurId,
        action: 'Effacer',
        issue: 'echec',
        cause: 'RoleProtege',
      },
    ])
  })
})
