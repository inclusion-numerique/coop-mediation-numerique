import { describe, expect, it } from 'vitest'
import { UtilisateurId } from '@/features/inscription/domain'
import {
  EchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'
import { valider } from './valider'
import type { FaitsInscription } from './valider-inscription'

const userId = UtilisateurId('11111111-1111-1111-1111-111111111111')

const maintenant = new Date('2026-07-16T10:00:00.000Z')

const inscriptionValidable: FaitsInscription = {
  userId,
  profilChoisi: true,
  compteDeRoleExiste: true,
  dejaValidee: false,
  cguDejaAcceptee: true,
}

const ACCEPTEES = success(undefined)

const SANS_CONTACT = 'Sans contact à inscrire'

const validerDepuis = (
  faits: FaitsInscription,
  inscriptionALaListe: string,
  acceptation: Result<void, EchecTechnique>,
) =>
  valider({
    lireFaitsInscription: async () => faits,
    enregistrerValidation: async () => undefined,
    inscrireALaListeDeDiffusion: async () => success(inscriptionALaListe),
    accepterLesInvitations: async () => acceptation,
    signaler: () => undefined,
  })({ userId, maintenant })

describe('valider l’inscription', () => {
  it('pose la date de validation sans toucher aux CGU déjà acceptées', async () => {
    expect(
      await validerDepuis(inscriptionValidable, SANS_CONTACT, ACCEPTEES),
    ).toEqual(
      success({
        userId,
        inscriptionValidee: maintenant,
        cguAPoser: null,
        inscriptionALaListe: SANS_CONTACT,
        acceptationDesInvitations: { _tag: 'InvitationsAcceptees' },
      }),
    )
  })

  it('pose les CGU quand elles n’avaient pas été acceptées, au parcours Dataspace', async () => {
    expect(
      await validerDepuis(
        { ...inscriptionValidable, cguDejaAcceptee: false },
        SANS_CONTACT,
        ACCEPTEES,
      ),
    ).toEqual(
      success({
        userId,
        inscriptionValidee: maintenant,
        cguAPoser: maintenant,
        inscriptionALaListe: SANS_CONTACT,
        acceptationDesInvitations: { _tag: 'InvitationsAcceptees' },
      }),
    )
  })

  it('valide l’inscription même quand l’acceptation des invitations échoue, et en porte l’échec', async () => {
    expect(
      await validerDepuis(
        inscriptionValidable,
        SANS_CONTACT,
        failure(EchecTechnique('courriel invalide')),
      ),
    ).toEqual(
      success({
        userId,
        inscriptionValidee: maintenant,
        cguAPoser: null,
        inscriptionALaListe: SANS_CONTACT,
        acceptationDesInvitations: {
          _tag: 'AcceptationEchouee',
          echec: EchecTechnique('courriel invalide'),
        },
      }),
    )
  })

  it.each<{ cas: string; faits: FaitsInscription; erreur: string }>([
    {
      cas: 'refuse la validation sans profil choisi',
      faits: { ...inscriptionValidable, profilChoisi: false },
      erreur: 'ProfilNonChoisi',
    },
    {
      cas: 'refuse la validation d’une inscription déjà validée',
      faits: { ...inscriptionValidable, dejaValidee: true },
      erreur: 'InscriptionDejaValidee',
    },
    {
      cas: 'refuse la validation sans compte de rôle en base',
      faits: { ...inscriptionValidable, compteDeRoleExiste: false },
      erreur: 'CompteDeRoleIntrouvable',
    },
  ])('$cas', async ({ faits, erreur }) => {
    expect(await validerDepuis(faits, SANS_CONTACT, ACCEPTEES)).toEqual(
      failure({ _tag: erreur, userId }),
    )
  })
})
