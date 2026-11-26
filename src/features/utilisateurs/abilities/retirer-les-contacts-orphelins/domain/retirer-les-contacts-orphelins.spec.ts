import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  EchecTechnique,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, success } from '@/libraries/result'
import type { ContactBrevo } from './contacts'
import type { RetirerLesContactsOrphelinsPorts } from './ports'
import { retirerLesContactsOrphelins } from './retirer-les-contacts-orphelins'

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

const ports: RetirerLesContactsOrphelinsPorts = {
  inscritsVivantsParmi: async () => new Set([vivant]),
  supprimerLeContact: async () => success(undefined),
  retirerLeContactDeLaListe: async () => success({ _tag: 'Retire' }),
}

describe('retirer les contacts orphelins', () => {
  it('supprime les seuls contacts anonymisés par l’effacement et retire de la liste ceux qui n’ont pas d’inscrit vivant', async () => {
    expect(await retirerLesContactsOrphelins(ports)({ contacts })).toEqual({
      success: true,
      data: {
        contacts: 5,
        anonymisesSupprimes: [courrielAnonymise],
        orphelinsRetires: [courrielInconnu, courrielParti],
        echecs: [],
      },
    })
  })

  it('ne retient pas un orphelin déjà absent de la liste', async () => {
    expect(
      await retirerLesContactsOrphelins({
        ...ports,
        retirerLeContactDeLaListe: async () => success({ _tag: 'DejaAbsent' }),
      })({ contacts }),
    ).toEqual({
      success: true,
      data: {
        contacts: 5,
        anonymisesSupprimes: [courrielAnonymise],
        orphelinsRetires: [],
        echecs: [],
      },
    })
  })

  it('poursuit après un échec et rapporte les courriels non traités', async () => {
    expect(
      await retirerLesContactsOrphelins({
        ...ports,
        supprimerLeContact: async () =>
          failure(EchecTechnique('Brevo indisponible')),
        retirerLeContactDeLaListe: async () =>
          failure(EchecTechnique('Brevo indisponible')),
      })({ contacts }),
    ).toEqual({
      success: true,
      data: {
        contacts: 5,
        anonymisesSupprimes: [],
        orphelinsRetires: [],
        echecs: [courrielAnonymise, courrielInconnu, courrielParti],
      },
    })
  })
})
