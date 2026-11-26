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

const utilisateurId = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'
const coordinateur = { id: '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8' }
const mediateur = { id: '2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809' }

const inscrit = (
  dispositif: Dispositif,
  mediateurId: MediateurId | null,
): InscritDeLaListe => ({
  id: UtilisateurId(utilisateurId),
  courriel: AdresseCourriel('jeanne@example.com'),
  prenom: null,
  nom: null,
  telephone: null,
  rattachements: rattachements<MediateurId, CoordinateurId>(mediateurId, null),
  dispositif: situationDansLeDispositif(dispositif, false),
  contrat: SANS_CONTRAT,
})

const activerPour = (
  compte: CompteQuiActive | null,
  inscritLu: InscritDeLaListe | null,
) =>
  activerLaMediationNumerique({
    lireLeCompteQuiActive: async () => compte,
    activer: async () => undefined,
    lireLInscritAInscrire: async () => inscritLu,
    inscrireALaListeDeDiffusion: async () => undefined,
  })({ utilisateurId })

const coordinateurSansMediation: CompteQuiActive = {
  id: utilisateurId,
  mediateur: null,
  coordinateur,
}

describe('activer la médiation numérique', () => {
  it('ajoute le rôle médiateur à un coordinateur et l’inscrit à la liste de diffusion', async () => {
    expect(
      await activerPour(
        coordinateurSansMediation,
        inscrit(Dispositif('HorsDispositif'), MediateurId(mediateur.id)),
      ),
    ).toEqual({
      success: true,
      data: {
        _tag: 'Activee',
        utilisateurId,
        coordinateurId: CoordinateurId(coordinateur.id),
        inscription: {
          utilisateurId: UtilisateurId(utilisateurId),
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
        coordinateurId: CoordinateurId(coordinateur.id),
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
        coordinateurId: CoordinateurId(coordinateur.id),
        inscription: null,
      },
    })
  })

  it('ne refait rien si la médiation est déjà active', async () => {
    expect(
      await activerPour({ id: utilisateurId, mediateur, coordinateur }, null),
    ).toEqual({ success: true, data: { _tag: 'DejaActivee' } })
  })

  it('est réservée aux coordinateurs', async () => {
    expect(
      await activerPour(
        { id: utilisateurId, mediateur, coordinateur: null },
        null,
      ),
    ).toEqual({ success: false, error: { _tag: 'NonCoordinateur' } })
  })

  it('signale un utilisateur introuvable', async () => {
    expect(await activerPour(null, null)).toEqual({
      success: false,
      error: { _tag: 'UtilisateurIntrouvable', utilisateurId },
    })
  })
})
