import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  CoordinateurId,
  Dispositif,
  type InscritDeLaListe,
  MediateurId,
  RoleBrevo,
  rattachements,
  SANS_CONTRAT,
  situationDansLeDispositif,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { activerLaMediationNumerique } from './activer-la-mediation-numerique'
import type { CompteQuiActive } from './ports'

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const coordinateurId = CoordinateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const mediateurId = MediateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

const inscrit = (
  dispositif: Dispositif,
  mediateurId: MediateurId | null,
): InscritDeLaListe => ({
  id: utilisateurId,
  courriel: AdresseCourriel('jeanne@example.com'),
  prenom: null,
  nom: null,
  telephone: null,
  rattachements: rattachements<MediateurId, CoordinateurId>(mediateurId, null),
  dispositif: situationDansLeDispositif(dispositif, false),
  contrat: SANS_CONTRAT,
})

const activation = (
  compte: CompteQuiActive | null,
  inscritLu: InscritDeLaListe | null,
) =>
  activerLaMediationNumerique({
    lireLeCompteQuiActive: async () => compte,
    activer: async () => undefined,
    lireLInscritAInscrire: async () => inscritLu,
    inscrireALaListeDeDiffusion: async () => undefined,
  })

const activerPour = (
  compte: CompteQuiActive | null,
  inscritLu: InscritDeLaListe | null,
) => activation(compte, inscritLu)({ utilisateurId })

const compteQuiActive = (
  mediateur: MediateurId | null,
  coordinateur: CoordinateurId | null,
): CompteQuiActive => ({
  id: utilisateurId,
  rattachements: rattachements(mediateur, coordinateur),
})

const coordinateurSansMediation = compteQuiActive(null, coordinateurId)

describe('activer la médiation numérique', () => {
  it('ajoute le rôle médiateur à un coordinateur et l’inscrit à la liste de diffusion', async () => {
    expect(
      await activerPour(
        coordinateurSansMediation,
        inscrit(Dispositif('HorsDispositif'), mediateurId),
      ),
    ).toEqual({
      success: true,
      data: {
        _tag: 'Activee',
        utilisateurId,
        coordinateurId,
        inscription: {
          utilisateurId,
          courriel: AdresseCourriel('jeanne@example.com'),
          prenom: null,
          nom: null,
          telephone: null,
          roles: [RoleBrevo('Mediateur')],
          contrat: SANS_CONTRAT,
        },
      },
    })
  })

  it('n’inscrit pas à la liste un inscrit qui n’y a aucun rôle', async () => {
    expect(
      await activerPour(
        coordinateurSansMediation,
        inscrit(Dispositif('HorsDispositif'), null),
      ),
    ).toEqual({
      success: true,
      data: {
        _tag: 'Activee',
        utilisateurId,
        coordinateurId,
        inscription: null,
      },
    })
  })

  it('n’inscrit pas à la liste un compte qui n’y est plus lisible', async () => {
    expect(await activerPour(coordinateurSansMediation, null)).toEqual({
      success: true,
      data: {
        _tag: 'Activee',
        utilisateurId,
        coordinateurId,
        inscription: null,
      },
    })
  })

  it('ne refait rien si la médiation est déjà active', async () => {
    expect(
      await activerPour(compteQuiActive(mediateurId, coordinateurId), null),
    ).toEqual({ success: true, data: { _tag: 'DejaActivee' } })
  })

  it('est réservée aux coordinateurs', async () => {
    expect(await activerPour(compteQuiActive(mediateurId, null), null)).toEqual(
      { success: false, error: { _tag: 'NonCoordinateur' } },
    )
  })

  it('signale un identifiant qui ne désigne aucun compte', async () => {
    expect(
      await activation(
        coordinateurSansMediation,
        null,
      )({ utilisateurId: null }),
    ).toEqual({
      success: false,
      error: { _tag: 'UtilisateurIntrouvable' },
    })
  })

  it('signale un utilisateur introuvable', async () => {
    expect(await activerPour(null, null)).toEqual({
      success: false,
      error: { _tag: 'UtilisateurIntrouvable' },
    })
  })
})
