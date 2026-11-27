import axios from 'axios'
import { signaler } from '@/configuration/telemetry/serveur'
import { AdresseCourriel, UtilisateurId } from '@/features/utilisateurs/domain'
import {
  cleApiBrevo,
  listeDesUtilisateurs,
} from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { brevoApiThrottle } from '@/features/utilisateurs/implementations/brevo/brevo-api-throttle.client'
import { enEchecTechnique, failure, success } from '@/libraries/result'
import type {
  CompteDuContact,
  ContactBrevo,
  LireLaPresenceDuContact,
} from '../../domain'

type PageDeContacts = {
  readonly contacts: readonly {
    readonly email?: string
    readonly attributes: Readonly<Record<string, unknown>>
  }[]
}

const TAILLE_DE_PAGE = 500

const lirePage = brevoApiThrottle(async (offset: number) => {
  const reponse = await axios.get<PageDeContacts>(
    `https://api.brevo.com/v3/contacts/lists/${listeDesUtilisateurs}/contacts`,
    {
      headers: { 'api-key': cleApiBrevo },
      params: {
        offset,
        limit: TAILLE_DE_PAGE,
        sort: 'asc',
      },
    },
  )
  return reponse.data
})

const compteDuContact = (identifiantExterne: unknown): CompteDuContact => {
  if (typeof identifiantExterne !== 'string') return { _tag: 'Aucun' }
  const utilisateurId = UtilisateurId.safe(identifiantExterne)
  return utilisateurId === null
    ? { _tag: 'Inconnu' }
    : { _tag: 'Compte', utilisateurId }
}

const versContacts = ({
  email,
  attributes,
}: PageDeContacts['contacts'][number]): readonly ContactBrevo[] => {
  const courriel = email === undefined ? null : AdresseCourriel.safe(email)
  return courriel === null
    ? []
    : [{ courriel, compte: compteDuContact(attributes['EXT_ID']) }]
}

const lireAPartirDe = async (
  offset: number,
): Promise<readonly ContactBrevo[]> => {
  const page = await lirePage(offset)
  const contacts = page.contacts.flatMap(versContacts)
  return page.contacts.length < TAILLE_DE_PAGE
    ? contacts
    : [...contacts, ...(await lireAPartirDe(offset + TAILLE_DE_PAGE))]
}

const ATTENTE_DE_LA_MISE_A_JOUR_DES_LISTES = 1000

const patienter = (millisecondes: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, millisecondes))

const lireLesListes = brevoApiThrottle(async (courriel: AdresseCourriel) => {
  const reponse = await axios.get<{ readonly listIds: readonly number[] }>(
    `https://api.brevo.com/v3/contacts/${encodeURIComponent(courriel)}`,
    { headers: { 'api-key': cleApiBrevo } },
  )
  return reponse.data.listIds
})

const estIntrouvable = (erreur: unknown): boolean =>
  axios.isAxiosError(erreur) && erreur.response?.status === 404

export const listerLesContacts = (): Promise<readonly ContactBrevo[]> =>
  lireAPartirDe(0)

export const lireLaPresenceDuContact: LireLaPresenceDuContact = async (
  courriel,
) => {
  await patienter(ATTENTE_DE_LA_MISE_A_JOUR_DES_LISTES)
  try {
    const listes = await lireLesListes(courriel)
    return success({ _tag: 'Present', listes: listes.length })
  } catch (erreur) {
    if (estIntrouvable(erreur)) return success({ _tag: 'Introuvable' })
    signaler(erreur)
    return failure(enEchecTechnique(erreur))
  }
}
