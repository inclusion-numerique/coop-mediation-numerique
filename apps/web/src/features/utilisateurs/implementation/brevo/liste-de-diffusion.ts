import { brevoApiThrottle } from '@app/web/external-apis/brevo/createBrevoContact'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import axios from 'axios'
import {
  type AdresseCourriel,
  type ContactAImporter,
  RoleBrevo,
} from '../../domain'

const libellesDesRoles: readonly {
  readonly role: RoleBrevo
  readonly libelle: string
}[] = [
  { role: RoleBrevo('Mediateur'), libelle: 'Médiateur' },
  { role: RoleBrevo('ConseillerNumerique'), libelle: 'Conseiller numérique' },
  { role: RoleBrevo('Coordinateur'), libelle: 'Coordinateur' },
]

const libelleDuRole = (role: RoleBrevo): string =>
  libellesDesRoles.find((entree) => entree.role === role)?.libelle ?? role

export type ContactBrevoJson = {
  readonly email: string
  readonly attributes: {
    readonly EXT_ID: string
    readonly FIRSTNAME: string
    readonly LASTNAME: string
    readonly SMS: string
    readonly ROLES: readonly string[]
  }
}

export const versContactBrevo = (
  contact: ContactAImporter,
): ContactBrevoJson => ({
  email: contact.courriel,
  attributes: {
    EXT_ID: contact.utilisateurId,
    FIRSTNAME: contact.prenom ?? '',
    LASTNAME: contact.nom ?? '',
    SMS: contact.telephone ?? '',
    ROLES: contact.roles.map(libelleDuRole),
  },
})

const enTetes = () => ({
  'api-key': ServerWebAppConfig.Brevo.apiKey,
  'Content-Type': 'application/json',
})

export const importerDansLaListe = brevoApiThrottle(
  async (lot: readonly ContactAImporter[]): Promise<number> => {
    const reponse = await axios.post<{ readonly processId: number }>(
      'https://api.brevo.com/v3/contacts/import',
      {
        jsonBody: lot.map(versContactBrevo),
        listIds: [ServerWebAppConfig.Brevo.usersListId],
        updateExistingContacts: true,
        emptyContactsAttributes: true,
        disableNotification: true,
      },
      { headers: enTetes() },
    )
    return reponse.data.processId
  },
)

const CONTACTS_ABSENTS_DE_LA_LISTE =
  'Contact already removed from list and/or does not exist'

const sontAbsentsDeLaListe = (erreur: unknown): boolean =>
  axios.isAxiosError(erreur) &&
  (erreur.response?.status === 404 ||
    (erreur.response?.status === 400 &&
      erreur.response.data?.message === CONTACTS_ABSENTS_DE_LA_LISTE))

export const retirerDeLaListe = brevoApiThrottle(
  async (lot: readonly AdresseCourriel[]): Promise<void> => {
    await axios
      .post(
        `https://api.brevo.com/v3/contacts/lists/${ServerWebAppConfig.Brevo.usersListId}/contacts/remove`,
        { emails: lot },
        { headers: enTetes() },
      )
      .catch((erreur: unknown) => {
        if (!sontAbsentsDeLaListe(erreur)) throw erreur
      })
  },
)
