import axios from 'axios'
import { AdresseCourriel, UtilisateurId } from '@/features/utilisateurs/domain'
import {
  cleApiBrevo,
  listeDesUtilisateurs,
} from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { brevoApiThrottle } from '@/features/utilisateurs/implementations/brevo/brevo-api-throttle.client'
import type { CompteDuContact, ContactBrevo } from '../../domain'

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

export const listerLesContacts = (): Promise<readonly ContactBrevo[]> =>
  lireAPartirDe(0)
