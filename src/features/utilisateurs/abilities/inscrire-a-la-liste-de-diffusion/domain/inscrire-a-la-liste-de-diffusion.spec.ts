import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  type CoordinateurId,
  Dispositif,
  type InscritDeLaListe,
  MediateurId,
  RoleBrevo,
  rattachements,
  SANS_CONTRAT,
  situationDansLeDispositif,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { success } from '@/libraries/result'
import { inscrireALaListeDeDiffusion } from './inscrire-a-la-liste-de-diffusion'

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')

const inscrit = (mediateurId: MediateurId | null): InscritDeLaListe => ({
  id: utilisateurId,
  courriel: AdresseCourriel('jeanne@example.com'),
  prenom: null,
  nom: null,
  telephone: null,
  rattachements: rattachements<MediateurId, CoordinateurId>(mediateurId, null),
  dispositif: situationDansLeDispositif(Dispositif('HorsDispositif'), false),
  contrat: SANS_CONTRAT,
})

const inscrirePour = (inscritLu: InscritDeLaListe | null) =>
  inscrireALaListeDeDiffusion({
    lireLInscritAInscrire: async () => inscritLu,
    importerLeContact: async () => undefined,
  })({ utilisateurId })

describe('inscrire à la liste de diffusion', () => {
  it('inscrit le contact d’un médiateur avec ses rôles', async () => {
    expect(
      await inscrirePour(
        inscrit(MediateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')),
      ),
    ).toEqual(
      success({
        _tag: 'ContactInscrit',
        contact: {
          utilisateurId,
          courriel: AdresseCourriel('jeanne@example.com'),
          prenom: null,
          nom: null,
          telephone: null,
          roles: [RoleBrevo('Mediateur')],
          contrat: SANS_CONTRAT,
        },
      }),
    )
  })

  it('n’inscrit pas un compte qui ne tient aucun rôle de la liste', async () => {
    expect(await inscrirePour(inscrit(null))).toEqual(
      success({ _tag: 'SansContactAInscrire' }),
    )
  })

  it('n’inscrit pas un compte absent de la liste', async () => {
    expect(await inscrirePour(null)).toEqual(
      success({ _tag: 'SansContactAInscrire' }),
    )
  })
})
