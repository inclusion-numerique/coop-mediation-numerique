import { brevoApiThrottle } from '@app/web/external-apis/brevo/createBrevoContact'
import { deleteBrevoContact } from '@app/web/external-apis/brevo/deleteBrevoContact'
import { deleteBrevoContactIfOrphan } from '@app/web/external-apis/brevo/deleteBrevoContactIfOrphan'
import { removeBrevoContactFromList } from '@app/web/external-apis/brevo/removeBrevoContactFromList'
import {
  AdresseCourriel,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import axios from 'axios'
import type {
  CompteDuContact,
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
    : [{ courriel, compte: compteDuContact(attributes.EXT_ID) }]
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
