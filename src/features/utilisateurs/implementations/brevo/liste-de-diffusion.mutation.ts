import axios from 'axios'
import { brevoActif } from '@/configuration/brevo'
import {
  cleApiBrevo,
  listeDesUtilisateurs,
} from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { brevoApiThrottle } from '@/features/utilisateurs/implementations/brevo/brevo-api-throttle.client'
import type { AdresseCourriel, ContactAImporter } from '../../domain'
import { versContactBrevo } from './contact-brevo.transfer'

const enTetes = () => ({
  'api-key': cleApiBrevo,
  'Content-Type': 'application/json',
})

export const importerDansLaListe = brevoApiThrottle(
  async (lot: readonly ContactAImporter[]): Promise<number> => {
    const reponse = await axios.post<{ readonly processId: number }>(
      'https://api.brevo.com/v3/contacts/import',
      {
        jsonBody: lot.map(versContactBrevo),
        listIds: [listeDesUtilisateurs],
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
        `https://api.brevo.com/v3/contacts/lists/${listeDesUtilisateurs}/contacts/remove`,
        { emails: lot },
        { headers: enTetes() },
      )
      .catch((erreur: unknown) => {
        if (!sontAbsentsDeLaListe(erreur)) throw erreur
      })
  },
)

export const inscrireLeContactALaListe = async (
  contact: ContactAImporter,
): Promise<void> => {
  if (!brevoActif()) return
  await importerDansLaListe([contact])
}
