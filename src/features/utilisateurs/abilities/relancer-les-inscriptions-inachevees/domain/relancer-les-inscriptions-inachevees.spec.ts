import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  type CompteARelancer,
  type CoordinateurId,
  type MediateurId,
  Prenom,
  Relance,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { RelancerLesInscriptionsInacheveesPorts } from './ports'
import { relancerLesInscriptionsInachevees } from './relancer-les-inscriptions-inachevees'

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
  rattachements: rattachements<MediateurId, CoordinateurId>(null, null),
  situation: {
    phase: 'Inscription',
    depuis: new Date(depuis),
    relance,
    suppressionAnnoncee,
    aProduit: false,
  },
})

const aRelancer = compte('2026-10-13T00:00:00.000Z', Relance('Aucune'), null)

const aEffacer = compte(
  '2026-07-07T00:00:00.000Z',
  Relance('AvertissementJ90'),
  new Date('2026-10-20T00:00:00.000Z'),
)

const ports = (
  comptes: readonly CompteARelancer[],
): RelancerLesInscriptionsInacheveesPorts => ({
  lireLesComptesARelancer: async () => comptes,
  envoyerLaRelance: async () => undefined,
  envoyerLAvertissement: async () => undefined,
  envoyerLAvisDEffacement: async () => undefined,
  effacerLInscription: async () => undefined,
  retirerDesListes: async () => undefined,
  noterLaRelance: async () => undefined,
})

describe('relancer les inscriptions inachevées', () => {
  it('relance une inscription inachevée depuis plus d’une semaine', async () => {
    expect(
      await relancerLesInscriptionsInachevees({
        maintenant,
        ports: ports([aRelancer]),
      }),
    ).toEqual([{ utilisateurId, action: 'Relancer', issue: 'fait' }])
  })

  it('efface une inscription dont la suppression annoncée est échue', async () => {
    expect(
      await relancerLesInscriptionsInachevees({
        maintenant,
        ports: ports([aEffacer]),
      }),
    ).toEqual([{ utilisateurId, action: 'Effacer', issue: 'fait' }])
  })

  it('ignore une inscription qui n’a encore rien à recevoir', async () => {
    expect(
      await relancerLesInscriptionsInachevees({
        maintenant,
        ports: ports([
          compte('2026-10-18T00:00:00.000Z', Relance('Aucune'), null),
        ]),
      }),
    ).toEqual([])
  })

  it('rapporte l’échec d’un effacement avec le message de l’erreur', async () => {
    expect(
      await relancerLesInscriptionsInachevees({
        maintenant,
        ports: {
          ...ports([aEffacer]),
          effacerLInscription: async () =>
            Promise.reject(new Error('base indisponible')),
        },
      }),
    ).toEqual([
      {
        utilisateurId,
        action: 'Effacer',
        issue: 'echec',
        cause: 'base indisponible',
      },
    ])
  })

  it('rapporte l’échec d’une relance rejetée sans erreur', async () => {
    expect(
      await relancerLesInscriptionsInachevees({
        maintenant,
        ports: {
          ...ports([aRelancer]),
          envoyerLaRelance: async () => Promise.reject('quota atteint'),
        },
      }),
    ).toEqual([
      {
        utilisateurId,
        action: 'Relancer',
        issue: 'echec',
        cause: 'quota atteint',
      },
    ])
  })
})
