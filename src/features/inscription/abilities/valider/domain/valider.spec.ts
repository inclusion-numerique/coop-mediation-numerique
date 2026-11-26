import { describe, expect, it } from 'vitest'
import { UtilisateurId } from '@/features/inscription/domain'
import { failure, success } from '@/libraries/result'
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

const validerDepuis = (
  faits: FaitsInscription,
  contactAInscrire: string | null,
) =>
  valider({
    lireFaitsInscription: async () => faits,
    enregistrerValidation: async () => undefined,
    lireLeContactAInscrire: async () => contactAInscrire,
    inscrireALaListeDeDiffusion: async () => undefined,
    effetsApresValidation: async () => undefined,
  })({ userId, maintenant })

describe('valider l’inscription', () => {
  it('pose la date de validation sans toucher aux CGU déjà acceptées', async () => {
    expect(await validerDepuis(inscriptionValidable, null)).toEqual(
      success({
        userId,
        inscriptionValidee: maintenant,
        cguAPoser: null,
        contactInscrit: null,
      }),
    )
  })

  it('pose les CGU quand elles n’avaient pas été acceptées, au parcours Dataspace', async () => {
    expect(
      await validerDepuis(
        { ...inscriptionValidable, cguDejaAcceptee: false },
        null,
      ),
    ).toEqual(
      success({
        userId,
        inscriptionValidee: maintenant,
        cguAPoser: maintenant,
        contactInscrit: null,
      }),
    )
  })

  it('inscrit à la liste de diffusion le contact que l’inscrit y a', async () => {
    expect(
      await validerDepuis(inscriptionValidable, 'camille@example.com'),
    ).toEqual(
      success({
        userId,
        inscriptionValidee: maintenant,
        cguAPoser: null,
        contactInscrit: 'camille@example.com',
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
    expect(await validerDepuis(faits, 'camille@example.com')).toEqual(
      failure({ _tag: erreur, userId }),
    )
  })
})
