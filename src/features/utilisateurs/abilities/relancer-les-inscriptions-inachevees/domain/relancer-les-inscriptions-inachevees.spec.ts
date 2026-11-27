import { describe, expect, it } from 'vitest'
import {
  type ActionDecidee,
  AdresseCourriel,
  type CompteARelancer,
  type CoordinateurId,
  type MediateurId,
  Prenom,
  Relance,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { EchecTechnique, failure, success } from '@/libraries/result'
import type { RelancerLesInscriptionsInacheveesPorts } from './ports'
import { relancerLesInscriptionsInachevees } from './relancer-les-inscriptions-inachevees'

const maintenant = new Date('2026-10-21T00:00:00.000Z')
const UN_JOUR = 24 * 60 * 60 * 1000

const ilYA = (jours: number): Date =>
  new Date(maintenant.getTime() - jours * UN_JOUR)

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')

const compte = (
  jours: number,
  relance: Relance,
  suppressionAnnoncee: Date | null,
): CompteARelancer => ({
  utilisateurId,
  courriel: AdresseCourriel('jeanne.martin@example.com'),
  prenom: Prenom('Jeanne'),
  rattachements: rattachements<MediateurId, CoordinateurId>(null, null),
  situation: {
    phase: 'Inscription',
    depuis: ilYA(jours),
    relance,
    suppressionAnnoncee,
    aProduit: false,
  },
})

const aRelancer = compte(8, Relance('Aucune'), null)

const aEffacer = compte(106, Relance('AvertissementJ90'), ilYA(1))

const avertissement: ActionDecidee = {
  _tag: 'Avertir',
  suppressionLe: new Date('2026-11-04T00:00:00.000Z'),
  joursRestants: 14,
}

const ports = (
  comptes: readonly CompteARelancer[],
): RelancerLesInscriptionsInacheveesPorts => ({
  lireLesComptesARelancer: async () => comptes,
  envoyerLaRelance: async () => success(undefined),
  envoyerLAvertissement: async () => success(undefined),
  envoyerLAvisDEffacement: async () => success(undefined),
  effacerLInscription: async () => success(undefined),
  retirerLeContactDeLaListe: async () => success({ _tag: 'Retire' }),
  lireLaPresenceDuContact: async () => success({ _tag: 'Present', listes: 0 }),
  supprimerLeContact: async () => success(undefined),
  noterLaRelance: async () => success(undefined),
})

const relancer = (portsDeLaRelance: RelancerLesInscriptionsInacheveesPorts) =>
  relancerLesInscriptionsInachevees(portsDeLaRelance)({ maintenant })

const echecTechnique = failure(EchecTechnique('service indisponible'))

describe('relancer les inscriptions inachevées', () => {
  it.each<{ cas: string; compteLu: CompteARelancer; action: ActionDecidee }>([
    {
      cas: 'relance à J+7 une inscription jamais relancée',
      compteLu: aRelancer,
      action: { _tag: 'Relancer', palier: 7 },
    },
    {
      cas: 'relance à J+30 une inscription relancée à J+7',
      compteLu: compte(31, Relance('J7'), null),
      action: { _tag: 'Relancer', palier: 30 },
    },
    {
      cas: 'relance à J+60 une inscription relancée à J+30',
      compteLu: compte(61, Relance('J30'), null),
      action: { _tag: 'Relancer', palier: 60 },
    },
    {
      cas: 'reprend à J+7 une inscription ancienne jamais relancée',
      compteLu: compte(40, Relance('Aucune'), null),
      action: { _tag: 'Relancer', palier: 7 },
    },
    {
      cas: 'efface une inscription dont la suppression annoncée est échue',
      compteLu: aEffacer,
      action: { _tag: 'Effacer' },
    },
    {
      cas: 'remet à zéro la relance d’une inscription reprise depuis moins d’une semaine',
      compteLu: compte(3, Relance('J7'), null),
      action: { _tag: 'Reinitialiser' },
    },
    {
      cas: 'avertit à J+90 en annonçant la suppression à J+105',
      compteLu: compte(91, Relance('J60'), null),
      action: avertissement,
    },
    {
      cas: 'laisse quatorze jours de préavis à une inscription avertie en retard',
      compteLu: compte(200, Relance('Aucune'), null),
      action: avertissement,
    },
    {
      cas: 'avertit de nouveau une inscription avertie sans date annoncée',
      compteLu: compte(200, Relance('AvertissementJ90'), null),
      action: avertissement,
    },
  ])('$cas', async ({ compteLu, action }) => {
    expect(await relancer(ports([compteLu]))).toEqual(
      success([{ utilisateurId, action, issue: 'fait' }]),
    )
  })

  it.each<{ cas: string; compteLu: CompteARelancer }>([
    {
      cas: 'une inscription qui n’a encore rien à recevoir',
      compteLu: compte(3, Relance('Aucune'), null),
    },
    {
      cas: 'une inscription entre deux relances',
      compteLu: compte(50, Relance('J30'), null),
    },
    {
      cas: 'une inscription avant la date de suppression annoncée',
      compteLu: compte(
        200,
        Relance('AvertissementJ90'),
        new Date(maintenant.getTime() + UN_JOUR),
      ),
    },
  ])('ignore $cas', async ({ compteLu }) => {
    expect(await relancer(ports([compteLu]))).toEqual(success([]))
  })

  it.each<{
    cas: string
    compteLu: CompteARelancer
    defaillant: Partial<RelancerLesInscriptionsInacheveesPorts>
    action: ActionDecidee
  }>([
    {
      cas: 'l’envoi d’une relance',
      compteLu: aRelancer,
      defaillant: { envoyerLaRelance: async () => echecTechnique },
      action: { _tag: 'Relancer', palier: 7 },
    },
    {
      cas: 'la note d’une relance',
      compteLu: aRelancer,
      defaillant: { noterLaRelance: async () => echecTechnique },
      action: { _tag: 'Relancer', palier: 7 },
    },
    {
      cas: 'l’envoi d’un avertissement',
      compteLu: compte(91, Relance('J60'), null),
      defaillant: { envoyerLAvertissement: async () => echecTechnique },
      action: avertissement,
    },
    {
      cas: 'l’effacement de l’inscription',
      compteLu: aEffacer,
      defaillant: { effacerLInscription: async () => echecTechnique },
      action: { _tag: 'Effacer' },
    },
    {
      cas: 'le retrait des listes de diffusion',
      compteLu: aEffacer,
      defaillant: { retirerLeContactDeLaListe: async () => echecTechnique },
      action: { _tag: 'Effacer' },
    },
    {
      cas: 'la lecture des listes du contact',
      compteLu: aEffacer,
      defaillant: { lireLaPresenceDuContact: async () => echecTechnique },
      action: { _tag: 'Effacer' },
    },
    {
      cas: 'la suppression du contact sorti de toutes les listes',
      compteLu: aEffacer,
      defaillant: { supprimerLeContact: async () => echecTechnique },
      action: { _tag: 'Effacer' },
    },
    {
      cas: 'l’envoi de l’avis d’effacement',
      compteLu: aEffacer,
      defaillant: { envoyerLAvisDEffacement: async () => echecTechnique },
      action: { _tag: 'Effacer' },
    },
  ])(
    'rapporte avec sa cause l’échec de $cas',
    async ({ compteLu, defaillant, action }) => {
      expect(await relancer({ ...ports([compteLu]), ...defaillant })).toEqual(
        success([
          {
            utilisateurId,
            action,
            issue: 'echec',
            cause: 'service indisponible',
          },
        ]),
      )
    },
  )
})
