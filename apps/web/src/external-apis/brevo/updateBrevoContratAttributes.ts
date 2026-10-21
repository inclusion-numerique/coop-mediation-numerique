import { prismaClient } from '@app/web/prismaClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import * as Sentry from '@sentry/nextjs'
import axios from 'axios'
import {
  type AttributsContratBrevo,
  attributsContratBrevo,
  contratsBrevoSelect,
} from './contratBrevo'
import {
  brevoApiThrottle,
  deploymentCanCreateBrevoContact,
} from './createBrevoContact'

/**
 * `PUT` partiel : Brevo ne modifie que les attributs envoyés, et ne crée pas un contact absent
 * (404, ignoré). Le reste du contact — ROLES, nom, appartenance aux listes — n'est pas touché.
 */
const updateContactAttributesImmediate = async (
  email: string,
  attributes: AttributsContratBrevo,
): Promise<boolean> => {
  try {
    await axios.put(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      { attributes },
      {
        headers: {
          'api-key': ServerWebAppConfig.Brevo.apiKey,
          'Content-Type': 'application/json',
        },
      },
    )
    return true
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false
    }
    Sentry.captureException?.(error)
    throw error
  }
}

const updateContactAttributes = brevoApiThrottle(
  updateContactAttributesImmediate,
)

/**
 * Met à jour UNIQUEMENT les dates de contrat d'un contact Brevo existant.
 *
 * Sert la resynchronisation qui suit un import idposte : des milliers de contacts d'un coup, pour
 * des dates qui seules ont pu changer. Renvoyer le contact entier (`updateBrevoContact`) y
 * réécrirait aussi ROLES et l'appartenance à la liste, hors du propos.
 */
export const updateBrevoContratAttributes = async (
  userId: string,
): Promise<boolean> => {
  if (!deploymentCanCreateBrevoContact()) return false

  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      personneMain: { select: contratsBrevoSelect },
    },
  })
  if (!user) return false

  const attributes = attributsContratBrevo(user.personneMain)
  // Sans contrat, rien à écrire — et surtout rien à effacer de ce que l'import manuel a posé.
  if (Object.keys(attributes).length === 0) return false

  return updateContactAttributes(user.email, attributes)
}
