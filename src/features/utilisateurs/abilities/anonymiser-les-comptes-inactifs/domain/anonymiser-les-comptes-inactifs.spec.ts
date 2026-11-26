import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  JAMAIS,
  type Jalon,
  jalon,
  Prenom,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { anonymiserLesComptesInactifs } from './anonymiser-les-comptes-inactifs'
import type {
  CompteAExaminer,
  PresenceCoordinateur,
  PresenceMediateur,
} from './compte-a-examiner'
import type { AnonymiserLesComptesInactifsDependances } from './ports'

const maintenant = new Date('2026-10-20T01:00:00.000Z')

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const autreUtilisateurId = UtilisateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')

const le = (date: string): Jalon => jalon(new Date(date))

const inactifDepuis2023: PresenceMediateur = {
  dernierCompteRendu: le('2023-06-01T00:00:00.000Z'),
  derniereConnexion: JAMAIS,
}

const compte = ({
  id = utilisateurId,
  inscritLe = new Date('2023-01-01T00:00:00.000Z'),
  mediateur = null,
  coordinateur = null,
  avertiLe = JAMAIS,
}: {
  readonly id?: UtilisateurId
  readonly inscritLe?: Date
  readonly mediateur?: PresenceMediateur | null
  readonly coordinateur?: PresenceCoordinateur | null
  readonly avertiLe?: Jalon
}): CompteAExaminer => ({
  id,
  courriel: AdresseCourriel('jeanne.martin@example.com'),
  prenom: Prenom('Jeanne'),
  inscritLe,
  presence: rattachements(mediateur, coordinateur),
  avertiLe,
})

const dependancesQuiReussissent = (
  comptes: readonly CompteAExaminer[],
): AnonymiserLesComptesInactifsDependances => ({
  lireLesComptesAExaminer: async () => comptes,
  avertirDeLaSuppression: async () => undefined,
  noterLAvertissement: async () => undefined,
  supprimerLeCompte: async () => undefined,
})

const simuler = (comptes: readonly CompteAExaminer[]) =>
  anonymiserLesComptesInactifs(dependancesQuiReussissent(comptes))({
    maintenant,
    simuler: true,
  })

const executer = (dependances: AnonymiserLesComptesInactifsDependances) =>
  anonymiserLesComptesInactifs(dependances)({ maintenant, simuler: false })

describe('anonymiser les comptes inactifs', () => {
  it.each<{
    cas: string
    compteExamine: CompteAExaminer
    etape: string
  }>([
    {
      cas: 'retient la plus récente du dernier compte rendu et de la dernière connexion d’un médiateur',
      compteExamine: compte({
        mediateur: {
          dernierCompteRendu: le('2023-03-01T00:00:00.000Z'),
          derniereConnexion: le('2025-05-01T00:00:00.000Z'),
        },
      }),
      etape: 'actif',
    },
    {
      cas: 'retient la dernière visite d’un coordinateur',
      compteExamine: compte({
        coordinateur: { derniereVisite: le('2026-01-01T00:00:00.000Z') },
      }),
      etape: 'actif',
    },
    {
      cas: 'retient la plus récente des traces d’un médiateur coordinateur',
      compteExamine: compte({
        mediateur: inactifDepuis2023,
        coordinateur: { derniereVisite: le('2026-01-01T00:00:00.000Z') },
      }),
      etape: 'actif',
    },
    {
      cas: 'se rabat sur l’inscription validée sans aucune autre trace',
      compteExamine: compte({
        inscritLe: new Date('2026-01-01T00:00:00.000Z'),
        mediateur: { dernierCompteRendu: JAMAIS, derniereConnexion: JAMAIS },
      }),
      etape: 'actif',
    },
    {
      cas: 'avertit un compte sans rôle inscrit depuis plus de 2 ans',
      compteExamine: compte({}),
      etape: 'aAvertir',
    },
    {
      cas: 'attend la fin du préavis d’un compte déjà averti',
      compteExamine: compte({
        mediateur: inactifDepuis2023,
        avertiLe: le('2026-10-01T01:00:00.000Z'),
      }),
      etape: 'enAttente',
    },
    {
      cas: 'supprime un compte averti dont le préavis est écoulé',
      compteExamine: compte({
        mediateur: inactifDepuis2023,
        avertiLe: le('2026-09-01T01:00:00.000Z'),
      }),
      etape: 'aSupprimer',
    },
  ])('en simulation, $cas sans agir', async ({ compteExamine, etape }) => {
    expect(await simuler([compteExamine])).toEqual([
      { utilisateurId, etape, issue: 'simule' },
    ])
  })

  it('agit sur chaque compte examiné, dans l’ordre de lecture', async () => {
    expect(
      await executer(
        dependancesQuiReussissent([
          compte({ mediateur: inactifDepuis2023 }),
          compte({
            id: autreUtilisateurId,
            mediateur: inactifDepuis2023,
            avertiLe: le('2026-09-01T01:00:00.000Z'),
          }),
        ]),
      ),
    ).toEqual([
      { utilisateurId, etape: 'aAvertir', issue: 'fait' },
      { utilisateurId: autreUtilisateurId, etape: 'aSupprimer', issue: 'fait' },
    ])
  })

  it('ne fait rien d’un compte encore actif', async () => {
    expect(
      await executer(
        dependancesQuiReussissent([
          compte({
            coordinateur: { derniereVisite: le('2026-01-01T00:00:00.000Z') },
          }),
        ]),
      ),
    ).toEqual([{ utilisateurId, etape: 'actif', issue: 'fait' }])
  })

  it('rapporte l’échec d’un avertissement avec le message de l’erreur', async () => {
    expect(
      await executer({
        ...dependancesQuiReussissent([
          compte({ mediateur: inactifDepuis2023 }),
        ]),
        avertirDeLaSuppression: async () =>
          Promise.reject(new Error('Brevo indisponible')),
      }),
    ).toEqual([
      {
        utilisateurId,
        etape: 'aAvertir',
        issue: 'echec',
        cause: 'Brevo indisponible',
      },
    ])
  })

  it('rapporte l’échec d’une suppression rejetée sans erreur', async () => {
    expect(
      await executer({
        ...dependancesQuiReussissent([
          compte({
            mediateur: inactifDepuis2023,
            avertiLe: le('2026-09-01T01:00:00.000Z'),
          }),
        ]),
        supprimerLeCompte: async () => Promise.reject('verrou en base'),
      }),
    ).toEqual([
      {
        utilisateurId,
        etape: 'aSupprimer',
        issue: 'echec',
        cause: 'verrou en base',
      },
    ])
  })
})
