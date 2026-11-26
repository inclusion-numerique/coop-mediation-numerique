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
import { EchecTechnique, failure, success } from '@/libraries/result'
import { anonymiserLesComptesInactifs } from './anonymiser-les-comptes-inactifs'
import type {
  CompteAExaminer,
  PresenceCoordinateur,
  PresenceMediateur,
} from './compte-a-examiner'
import type { EtapeInactivite } from './etape-inactivite'
import type { AnonymiserLesComptesInactifsPorts } from './ports'

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
): AnonymiserLesComptesInactifsPorts => ({
  lireLesComptesAExaminer: async () => comptes,
  avertirDeLaSuppression: async () => success(undefined),
  noterLAvertissement: async () => success(undefined),
  supprimerLeCompte: async () => success(undefined),
})

const simuler = (comptes: readonly CompteAExaminer[]) =>
  anonymiserLesComptesInactifs(dependancesQuiReussissent(comptes))({
    maintenant,
    simuler: true,
  })

const executer = (dependances: AnonymiserLesComptesInactifsPorts) =>
  anonymiserLesComptesInactifs(dependances)({ maintenant, simuler: false })

describe('anonymiser les comptes inactifs', () => {
  it.each<{
    cas: string
    compteExamine: CompteAExaminer
    etape: EtapeInactivite
  }>([
    {
      cas: 'retient la plus récente du dernier compte rendu et de la dernière connexion d’un médiateur',
      compteExamine: compte({
        mediateur: {
          dernierCompteRendu: le('2023-03-01T00:00:00.000Z'),
          derniereConnexion: le('2025-05-01T00:00:00.000Z'),
        },
      }),
      etape: { _tag: 'actif' },
    },
    {
      cas: 'retient la dernière visite d’un coordinateur',
      compteExamine: compte({
        coordinateur: { derniereVisite: le('2026-01-01T00:00:00.000Z') },
      }),
      etape: { _tag: 'actif' },
    },
    {
      cas: 'retient la plus récente des traces d’un médiateur coordinateur',
      compteExamine: compte({
        mediateur: inactifDepuis2023,
        coordinateur: { derniereVisite: le('2026-01-01T00:00:00.000Z') },
      }),
      etape: { _tag: 'actif' },
    },
    {
      cas: 'se rabat sur l’inscription validée sans aucune autre trace',
      compteExamine: compte({
        inscritLe: new Date('2026-01-01T00:00:00.000Z'),
        mediateur: { dernierCompteRendu: JAMAIS, derniereConnexion: JAMAIS },
      }),
      etape: { _tag: 'actif' },
    },
    {
      cas: 'avertit un compte sans rôle inscrit depuis plus de 2 ans',
      compteExamine: compte({}),
      etape: {
        _tag: 'aAvertir',
        dateDeSuppression: new Date('2026-11-19T01:00:00.000Z'),
      },
    },
    {
      cas: 'attend la fin du préavis d’un compte déjà averti',
      compteExamine: compte({
        mediateur: inactifDepuis2023,
        avertiLe: le('2026-10-01T01:00:00.000Z'),
      }),
      etape: {
        _tag: 'enAttente',
        dateDeSuppression: new Date('2026-10-31T01:00:00.000Z'),
      },
    },
    {
      cas: 'supprime un compte averti dont le préavis est écoulé',
      compteExamine: compte({
        mediateur: inactifDepuis2023,
        avertiLe: le('2026-09-01T01:00:00.000Z'),
      }),
      etape: { _tag: 'aSupprimer' },
    },
  ])('en simulation, $cas sans agir', async ({ compteExamine, etape }) => {
    expect(await simuler([compteExamine])).toEqual(
      success([{ utilisateurId, etape, issue: 'simule' }]),
    )
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
    ).toEqual(
      success([
        {
          utilisateurId,
          etape: {
            _tag: 'aAvertir',
            dateDeSuppression: new Date('2026-11-19T01:00:00.000Z'),
          },
          issue: 'fait',
        },
        {
          utilisateurId: autreUtilisateurId,
          etape: { _tag: 'aSupprimer' },
          issue: 'fait',
        },
      ]),
    )
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
    ).toEqual(
      success([{ utilisateurId, etape: { _tag: 'actif' }, issue: 'fait' }]),
    )
  })

  it('rapporte l’échec d’un avertissement avec sa cause', async () => {
    expect(
      await executer({
        ...dependancesQuiReussissent([
          compte({ mediateur: inactifDepuis2023 }),
        ]),
        avertirDeLaSuppression: async () =>
          failure(EchecTechnique('Brevo indisponible')),
      }),
    ).toEqual(
      success([
        {
          utilisateurId,
          etape: {
            _tag: 'aAvertir',
            dateDeSuppression: new Date('2026-11-19T01:00:00.000Z'),
          },
          issue: 'echec',
          cause: 'Brevo indisponible',
        },
      ]),
    )
  })

  it('rapporte l’échec de la note d’un avertissement avec sa cause', async () => {
    expect(
      await executer({
        ...dependancesQuiReussissent([
          compte({ mediateur: inactifDepuis2023 }),
        ]),
        noterLAvertissement: async () =>
          failure(EchecTechnique('base indisponible')),
      }),
    ).toEqual(
      success([
        {
          utilisateurId,
          etape: {
            _tag: 'aAvertir',
            dateDeSuppression: new Date('2026-11-19T01:00:00.000Z'),
          },
          issue: 'echec',
          cause: 'base indisponible',
        },
      ]),
    )
  })

  it('rapporte le refus d’une suppression par son motif', async () => {
    expect(
      await executer({
        ...dependancesQuiReussissent([
          compte({
            mediateur: inactifDepuis2023,
            avertiLe: le('2026-09-01T01:00:00.000Z'),
          }),
        ]),
        supprimerLeCompte: async () => failure({ _tag: 'RoleProtege' }),
      }),
    ).toEqual(
      success([
        {
          utilisateurId,
          etape: { _tag: 'aSupprimer' },
          issue: 'echec',
          cause: 'RoleProtege',
        },
      ]),
    )
  })

  it.each<{
    cas: string
    inscritLe: string
    avertiLe: Jalon
    etape: EtapeInactivite
  }>([
    {
      cas: 'avertit 30 jours avant les 2 ans d’inactivité',
      inscritLe: '2024-11-19T01:00:00.000Z',
      avertiLe: JAMAIS,
      etape: {
        _tag: 'aAvertir',
        dateDeSuppression: new Date('2026-11-19T01:00:00.000Z'),
      },
    },
    {
      cas: 'n’avertit pas la veille du préavis',
      inscritLe: '2024-11-20T01:00:00.000Z',
      avertiLe: JAMAIS,
      etape: { _tag: 'actif' },
    },
    {
      cas: 'n’avertit pas deux fois',
      inscritLe: '2024-11-10T00:00:00.000Z',
      avertiLe: le('2026-10-15T01:00:00.000Z'),
      etape: {
        _tag: 'enAttente',
        dateDeSuppression: new Date('2026-11-14T01:00:00.000Z'),
      },
    },
    {
      cas: 'avertit de nouveau un compte revenu après un avertissement puis redevenu inactif',
      inscritLe: '2024-11-10T00:00:00.000Z',
      avertiLe: le('2024-09-01T00:00:00.000Z'),
      etape: {
        _tag: 'aAvertir',
        dateDeSuppression: new Date('2026-11-19T01:00:00.000Z'),
      },
    },
  ])('$cas', async ({ inscritLe, avertiLe, etape }) => {
    expect(
      await simuler([compte({ inscritLe: new Date(inscritLe), avertiLe })]),
    ).toEqual(success([{ utilisateurId, etape, issue: 'simule' }]))
  })
})
