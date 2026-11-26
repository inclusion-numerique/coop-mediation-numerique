import { describe, expect, it } from 'vitest'
import { AdresseCourriel, UtilisateurId } from '@/features/utilisateurs/domain'
import type { ContactBrevo } from './contacts'
import {
  type RetirerLesContactsOrphelinsDependances,
  retirerLesContactsOrphelins,
} from './retirer-les-contacts-orphelins'

const vivant = UtilisateurId('3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f')
const parti = UtilisateurId('4d5e6f7a-8b9c-4d0e-9f1a-2b3c4d5e6f7a')
const anonymise = UtilisateurId('5e6f7a8b-9c0d-4e1f-8a2b-3c4d5e6f7a8b')

const courrielAnonymise = AdresseCourriel(
  'deleted+abcdef012345@coop-numerique.anct.gouv.fr',
)
const courrielInconnu = AdresseCourriel('deleted+abc@example.com')
const courrielParti = AdresseCourriel('parti@example.com')

const contacts: readonly ContactBrevo[] = [
  {
    courriel: courrielAnonymise,
    compte: { _tag: 'Compte', utilisateurId: anonymise },
  },
  { courriel: courrielInconnu, compte: { _tag: 'Inconnu' } },
  {
    courriel: AdresseCourriel('vivant@example.com'),
    compte: { _tag: 'Compte', utilisateurId: vivant },
  },
  {
    courriel: courrielParti,
    compte: { _tag: 'Compte', utilisateurId: parti },
  },
  {
    courriel: AdresseCourriel('sans-id@example.com'),
    compte: { _tag: 'Aucun' },
  },
]

const dependances: RetirerLesContactsOrphelinsDependances = {
  listerLesContacts: async () => contacts,
  inscritsVivantsParmi: async () => new Set([vivant]),
  supprimerLeContact: async () => undefined,
  retirerLeContactDeLaListe: async () => ({ _tag: 'Retire' }),
}

describe('retirer les contacts orphelins', () => {
  it('supprime les seuls contacts anonymisés par l’effacement et retire de la liste ceux qui n’ont pas d’inscrit vivant', async () => {
    expect(await retirerLesContactsOrphelins(dependances)()).toEqual({
      contacts: 5,
      anonymisesSupprimes: 1,
      orphelinsRetires: 2,
      echecs: [],
    })
  })

  it('ne compte pas un orphelin déjà absent de la liste', async () => {
    expect(
      await retirerLesContactsOrphelins({
        ...dependances,
        retirerLeContactDeLaListe: async () => ({ _tag: 'DejaAbsent' }),
      })(),
    ).toEqual({
      contacts: 5,
      anonymisesSupprimes: 1,
      orphelinsRetires: 0,
      echecs: [],
    })
  })

  it('poursuit après un échec et rapporte les courriels non traités', async () => {
    expect(
      await retirerLesContactsOrphelins({
        ...dependances,
        supprimerLeContact: async () =>
          Promise.reject(new Error('Brevo indisponible')),
        retirerLeContactDeLaListe: async () =>
          Promise.reject(new Error('Brevo indisponible')),
      })(),
    ).toEqual({
      contacts: 5,
      anonymisesSupprimes: 0,
      orphelinsRetires: 0,
      echecs: [courrielAnonymise, courrielInconnu, courrielParti],
    })
  })
})
