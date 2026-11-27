import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import { ContactReferent } from '../../../domain/contact-referent'
import { DenominationEmployeuse } from '../../../domain/denomination-employeuse'
import type { Employeuse } from '../../../domain/employeuse'
import { EmployeuseId } from '../../../domain/employeuse-id'
import { UtilisateurId } from '../../../domain/utilisateur-id'
import { consulterEmployeuse } from './consulter-employeuse'
import { CourrielDeLaPersonne } from './courriel-de-la-personne'
import type { PersonneEmployee } from './employeuse-consultee'
import { NomDeLaPersonne } from './nom-de-la-personne'

const employeuseId = EmployeuseId(7)

const employeuse: Employeuse = {
  id: employeuseId,
  denomination: DenominationEmployeuse('Croix Rouge'),
  denominationSirene: null,
  siret: null,
  rna: null,
  adresse: null,
  contactReferent: ContactReferent(null),
  creation: null,
  modification: null,
  suppression: null,
}

const camille: PersonneEmployee = {
  utilisateurId: UtilisateurId('0927f824-b84d-4840-ae2e-e4a96a7a519b'),
  prenom: NomDeLaPersonne('Camille'),
  nom: NomDeLaPersonne('Martin'),
  nomComplet: null,
  courriel: CourrielDeLaPersonne('camille.martin@example.fr'),
}

const dominique: PersonneEmployee = {
  utilisateurId: UtilisateurId('f98724ab-93d2-46cd-bff6-1821dd6a6da7'),
  prenom: null,
  nom: null,
  nomComplet: NomDeLaPersonne('Dominique Petit'),
  courriel: CourrielDeLaPersonne('dominique.petit@example.fr'),
}

describe('consulter une employeuse', () => {
  it('liste une seule fois chaque personne employée, même affectée plusieurs fois', async () => {
    expect(
      await consulterEmployeuse({
        lireLEmployeuse: async () => ({
          employeuse,
          affectations: [
            { personne: camille },
            { personne: dominique },
            { personne: camille },
          ],
        }),
      })({ employeuseId }),
    ).toEqual(success({ employeuse, personnesEmployees: [camille, dominique] }))
  })

  it('écarte une affectation sans compte utilisateur', async () => {
    expect(
      await consulterEmployeuse({
        lireLEmployeuse: async () => ({
          employeuse,
          affectations: [{ personne: null }, { personne: dominique }],
        }),
      })({ employeuseId }),
    ).toEqual(success({ employeuse, personnesEmployees: [dominique] }))
  })

  it('ne trouve pas une employeuse inconnue ou supprimée', async () => {
    expect(
      await consulterEmployeuse({ lireLEmployeuse: async () => null })({
        employeuseId,
      }),
    ).toEqual(success(null))
  })
})
