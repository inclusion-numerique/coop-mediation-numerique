import {
  Contact,
  type Courriel,
  isValidTelephone,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Prisma } from '@prisma/client'
import {
  courrielsValides,
  nonVide,
  SEPARATEUR_LISTE,
  sitesWebSaisis,
} from '../../../domain/saisie'

const estObjet = (valeur: unknown): valeur is Record<string, unknown> =>
  valeur != null && typeof valeur === 'object' && !Array.isArray(valeur)

const texteDe = (
  source: Record<string, unknown>,
  clef: string,
): string | null => {
  const valeur = source[clef]

  return typeof valeur === 'string' ? nonVide(valeur) : null
}

const courrielsDe = (contact: Record<string, unknown>): readonly Courriel[] => {
  const { courriels } = contact
  const email = estObjet(courriels) ? courriels.email : null

  return courrielsValides(
    (typeof email === 'string' ? email : '').split(SEPARATEUR_LISTE),
  )
}

const telephoneDe = (contact: Record<string, unknown>): string | null => {
  const telephone = texteDe(contact, 'telephone')

  return telephone != null && isValidTelephone(telephone) ? telephone : null
}

export const contactDuRegistre = (contact: Prisma.JsonValue): Contact => {
  if (!estObjet(contact)) return Contact({})

  const telephone = telephoneDe(contact)
  const courriels = courrielsDe(contact)
  const sitesWeb = sitesWebSaisis(texteDe(contact, 'site_web'))

  return Contact({
    ...(telephone == null ? {} : { telephone }),
    ...(courriels.length === 0 ? {} : { courriels: [...courriels] }),
    ...(sitesWeb.length === 0 ? {} : { site_web: [...sitesWeb] }),
  })
}
