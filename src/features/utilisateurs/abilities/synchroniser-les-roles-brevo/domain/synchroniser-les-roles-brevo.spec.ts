import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  type ContactAImporter,
  type CoordinateurId,
  Dispositif,
  EchecTechnique,
  type InscritDeLaListe,
  MediateurId,
  RoleBrevo,
  rattachements,
  SANS_CONTRAT,
  situationDansLeDispositif,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, success } from '@/libraries/result'
import { IdentifiantDImport } from './identifiant-d-import'
import type { SynchroniserLesRolesBrevoPorts } from './ports'
import { synchroniserLesRolesBrevo } from './synchroniser-les-roles-brevo'
import { TailleDeLot } from './taille-de-lot'

const utilisateurId = UtilisateurId('3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f')
const illisible = UtilisateurId('4d5e6f7a-8b9c-4d0e-9f1a-2b3c4d5e6f7a')
const mediateurId = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')

const hors = situationDansLeDispositif(Dispositif('HorsDispositif'), false)

const inscrit = (
  courriel: string,
  mediateur: MediateurId | null,
): InscritDeLaListe => ({
  id: utilisateurId,
  courriel: AdresseCourriel(courriel),
  prenom: null,
  nom: null,
  telephone: null,
  rattachements: rattachements<MediateurId, CoordinateurId>(mediateur, null),
  dispositif: hors,
  contrat: SANS_CONTRAT,
})

const premier = AdresseCourriel('premier@example.com')
const deuxieme = AdresseCourriel('deuxieme@example.com')
const troisieme = AdresseCourriel('troisieme@example.com')
const sansRole = AdresseCourriel('sans-role@example.com')

const identifiantDImport = IdentifiantDImport(42)

const tailles = {
  tailleDesImports: TailleDeLot(2),
  tailleDesRetraits: TailleDeLot(150),
}

const ports: SynchroniserLesRolesBrevoPorts = {
  lireLesInscrits: async () => ({
    inscrits: [
      inscrit(premier, mediateurId),
      inscrit(sansRole, null),
      inscrit(deuxieme, mediateurId),
      inscrit(troisieme, mediateurId),
    ],
    illisibles: [illisible],
  }),
  importerUnLot: async () => success(identifiantDImport),
  retirerUnLot: async () => success(undefined),
}

const contact = (courriel: AdresseCourriel): ContactAImporter => ({
  utilisateurId,
  courriel,
  prenom: null,
  nom: null,
  telephone: null,
  roles: [RoleBrevo('Mediateur')],
  contrat: SANS_CONTRAT,
})

describe('synchroniser les rôles Brevo', () => {
  it('importe par lots les inscrits qui tiennent un rôle et retire les autres', async () => {
    expect(await synchroniserLesRolesBrevo(ports)(tailles)).toEqual({
      success: true,
      data: {
        inscrits: 4,
        illisibles: [illisible],
        importes: [
          {
            contacts: [contact(premier), contact(deuxieme)],
            identifiant: identifiantDImport,
          },
          { contacts: [contact(troisieme)], identifiant: identifiantDImport },
        ],
        retires: [[sansRole]],
        echecs: [],
      },
    })
  })

  it('rapporte les courriels de chaque lot en échec sans interrompre les suivants', async () => {
    expect(
      await synchroniserLesRolesBrevo({
        ...ports,
        importerUnLot: async () =>
          failure(EchecTechnique('Brevo indisponible')),
        retirerUnLot: async () => failure(EchecTechnique('Brevo indisponible')),
      })(tailles),
    ).toEqual({
      success: true,
      data: {
        inscrits: 4,
        illisibles: [illisible],
        importes: [],
        retires: [],
        echecs: [
          { _tag: 'ImportEchoue', courriels: [premier, deuxieme] },
          { _tag: 'ImportEchoue', courriels: [troisieme] },
          { _tag: 'RetraitEchoue', courriels: [sansRole] },
        ],
      },
    })
  })

  it('n’envoie aucun lot sans inscrit', async () => {
    expect(
      await synchroniserLesRolesBrevo({
        ...ports,
        lireLesInscrits: async () => ({ inscrits: [], illisibles: [] }),
      })(tailles),
    ).toEqual({
      success: true,
      data: {
        inscrits: 0,
        illisibles: [],
        importes: [],
        retires: [],
        echecs: [],
      },
    })
  })
})
