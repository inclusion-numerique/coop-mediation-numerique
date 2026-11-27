import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  CoordinateurId,
  Dispositif,
  type InscritDeLaListe,
  MediateurId,
  type RattachementsDuCompte,
  RoleBrevo,
  rattachements,
  SANS_CONTRAT,
  type SituationDansLeDispositif,
  situationDansLeDispositif,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { success } from '@/libraries/result'
import { inscrireALaListeDeDiffusion } from './inscrire-a-la-liste-de-diffusion'

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const mediateur = MediateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')
const coordinateur = CoordinateurId('9b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e')

const rattachementsDu = (
  mediateurId: MediateurId | null,
  coordinateurId: CoordinateurId | null,
): RattachementsDuCompte => rattachements(mediateurId, coordinateurId)

const hors = situationDansLeDispositif(Dispositif('HorsDispositif'), false)
const conseiller = situationDansLeDispositif(
  Dispositif('ConseillerNumerique'),
  false,
)
const coordinateurDuDispositif = situationDansLeDispositif(
  Dispositif('ConseillerNumerique'),
  true,
)

const inscrit = (
  rattache: RattachementsDuCompte,
  dispositif: SituationDansLeDispositif,
): InscritDeLaListe => ({
  id: utilisateurId,
  courriel: AdresseCourriel('jeanne@example.com'),
  prenom: null,
  nom: null,
  telephone: null,
  rattachements: rattache,
  dispositif,
  contrat: SANS_CONTRAT,
})

const inscrirePour = (inscritLu: InscritDeLaListe | null) =>
  inscrireALaListeDeDiffusion({
    lireLInscritAInscrire: async () => inscritLu,
    importerLeContact: async () => undefined,
  })({ utilisateurId })

describe('inscrire à la liste de diffusion', () => {
  it.each<{
    cas: string
    rattache: RattachementsDuCompte
    dispositif: SituationDansLeDispositif
    roles: readonly RoleBrevo[]
  }>([
    {
      cas: 'un médiateur hors dispositif',
      rattache: rattachementsDu(mediateur, null),
      dispositif: hors,
      roles: [RoleBrevo('Mediateur')],
    },
    {
      cas: 'un médiateur conseiller numérique',
      rattache: rattachementsDu(mediateur, null),
      dispositif: conseiller,
      roles: [RoleBrevo('Mediateur'), RoleBrevo('ConseillerNumerique')],
    },
    {
      cas: 'un coordinateur hors dispositif',
      rattache: rattachementsDu(null, coordinateur),
      dispositif: hors,
      roles: [RoleBrevo('Coordinateur')],
    },
    {
      cas: 'un coordinateur du dispositif sans rôle dans la Coop',
      rattache: rattachementsDu(null, null),
      dispositif: coordinateurDuDispositif,
      roles: [RoleBrevo('ConseillerNumerique'), RoleBrevo('Coordinateur')],
    },
    {
      cas: 'un médiateur et coordinateur du dispositif',
      rattache: rattachementsDu(mediateur, coordinateur),
      dispositif: coordinateurDuDispositif,
      roles: [
        RoleBrevo('Mediateur'),
        RoleBrevo('ConseillerNumerique'),
        RoleBrevo('Coordinateur'),
      ],
    },
  ])(
    'inscrit le contact de $cas avec ses rôles',
    async ({ rattache, dispositif, roles }) => {
      expect(await inscrirePour(inscrit(rattache, dispositif))).toEqual(
        success({
          _tag: 'ContactInscrit',
          contact: {
            utilisateurId,
            courriel: AdresseCourriel('jeanne@example.com'),
            prenom: null,
            nom: null,
            telephone: null,
            roles,
            contrat: SANS_CONTRAT,
          },
        }),
      )
    },
  )

  it('n’inscrit pas un compte qui ne tient aucun rôle de la liste', async () => {
    expect(
      await inscrirePour(inscrit(rattachementsDu(null, null), hors)),
    ).toEqual(success({ _tag: 'SansContactAInscrire' }))
  })

  it('n’inscrit pas un compte absent de la liste', async () => {
    expect(await inscrirePour(null)).toEqual(
      success({ _tag: 'SansContactAInscrire' }),
    )
  })
})
