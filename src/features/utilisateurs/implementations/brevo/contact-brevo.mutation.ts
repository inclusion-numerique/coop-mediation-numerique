import axios from 'axios'
import { brevoActif } from '@/configuration/brevo'
import { signaler } from '@/configuration/telemetry/serveur'
import {
  cleApiBrevo,
  listeDesUtilisateurs,
} from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { brevoApiThrottle } from '@/features/utilisateurs/implementations/brevo/brevo-api-throttle.client'
import { enEchecTechnique, failure, success } from '@/libraries/result'
import type {
  RetirerLeContactDeLaListe,
  SupprimerLeContact,
} from '../../domain'

const CONTACT_ABSENT_DE_LA_LISTE =
  'Contact already removed from list and/or does not exist'

const estIntrouvable = (erreur: unknown): boolean =>
  axios.isAxiosError(erreur) && erreur.response?.status === 404

const estAbsentDeLaListe = (erreur: unknown): boolean =>
  estIntrouvable(erreur) ||
  (axios.isAxiosError(erreur) &&
    erreur.response?.status === 400 &&
    erreur.response.data?.message === CONTACT_ABSENT_DE_LA_LISTE)

const effacerLeContact = brevoApiThrottle((courriel: string) =>
  axios.delete(
    `https://api.brevo.com/v3/contacts/${encodeURIComponent(courriel)}`,
    { headers: { 'api-key': cleApiBrevo } },
  ),
)

const sortirDeLaListe = brevoApiThrottle((courriel: string) =>
  axios.post(
    `https://api.brevo.com/v3/contacts/lists/${listeDesUtilisateurs}/contacts/remove`,
    { emails: [courriel] },
    {
      headers: {
        'api-key': cleApiBrevo,
        'Content-Type': 'application/json',
      },
    },
  ),
)

export const supprimerLeContact: SupprimerLeContact = async (courriel) => {
  if (!brevoActif()) return success(undefined)
  try {
    await effacerLeContact(courriel)
    return success(undefined)
  } catch (erreur) {
    if (estIntrouvable(erreur)) return success(undefined)
    signaler(erreur)
    return failure(enEchecTechnique(erreur))
  }
}

export const retirerLeContactDeLaListe: RetirerLeContactDeLaListe = async (
  courriel,
) => {
  if (!brevoActif()) return success({ _tag: 'DejaAbsent' })
  try {
    await sortirDeLaListe(courriel)
    return success({ _tag: 'Retire' })
  } catch (erreur) {
    if (estAbsentDeLaListe(erreur)) return success({ _tag: 'DejaAbsent' })
    signaler(erreur)
    return failure(enEchecTechnique(erreur))
  }
}
