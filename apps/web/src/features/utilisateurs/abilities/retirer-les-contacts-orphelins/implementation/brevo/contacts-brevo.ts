import { brevoApiThrottle } from '@app/web/external-apis/brevo/createBrevoContact'
import { deleteBrevoContact } from '@app/web/external-apis/brevo/deleteBrevoContact'
import { deleteBrevoContactIfOrphan } from '@app/web/external-apis/brevo/deleteBrevoContactIfOrphan'
import { removeBrevoContactFromList } from '@app/web/external-apis/brevo/removeBrevoContactFromList'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import axios from 'axios'
import type {
  ContactBrevo,
  RetirerLesContactsOrphelinsPorts,
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
    'https://api.brevo.com/v3/contacts',
    {
      headers: { 'api-key': ServerWebAppConfig.Brevo.apiKey },
      params: {
        listId: ServerWebAppConfig.Brevo.usersListId,
        offset,
        limit: TAILLE_DE_PAGE,
        sort: 'asc',
      },
    },
  )
  return reponse.data
})

const versContact = ({
  email,
  attributes,
}: PageDeContacts['contacts'][number]): ContactBrevo => ({
  courriel: email ?? null,
  identifiantExterne:
    typeof attributes.EXT_ID === 'string' ? attributes.EXT_ID : null,
})

const lireAPartirDe = async (
  offset: number,
): Promise<readonly ContactBrevo[]> => {
  const page = await lirePage(offset)
  const contacts = page.contacts.map(versContact)
  return page.contacts.length < TAILLE_DE_PAGE
    ? contacts
    : [...contacts, ...(await lireAPartirDe(offset + TAILLE_DE_PAGE))]
}

export const contactsBrevoPorts: RetirerLesContactsOrphelinsPorts = {
  listerLesContacts: () => lireAPartirDe(0),
  supprimerLeContact: async (courriel) => {
    await deleteBrevoContact(courriel)
  },
  retirerLeContactDeLaListe: async (courriel) => {
    await removeBrevoContactFromList(
      courriel,
      ServerWebAppConfig.Brevo.usersListId,
    )
    await deleteBrevoContactIfOrphan(courriel)
  },
}
