import axios from 'axios'
import { brevoActif } from '@/configuration/brevo'
import { signaler } from '@/configuration/telemetry/serveur'
import { cleApiBrevo } from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { brevoApiThrottle } from '@/features/utilisateurs/implementations/brevo/brevo-api-throttle.client'
import { enEchecTechnique, failure, success } from '@/libraries/result'
import type { LireLaPresenceDuContact } from '../../domain'

const ATTENTE_DE_LA_MISE_A_JOUR_DES_LISTES = 1000

const patienter = (millisecondes: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, millisecondes))

const lireLesListes = brevoApiThrottle(async (courriel: string) => {
  const reponse = await axios.get<{ readonly listIds: readonly number[] }>(
    `https://api.brevo.com/v3/contacts/${encodeURIComponent(courriel)}`,
    { headers: { 'api-key': cleApiBrevo } },
  )
  return reponse.data.listIds
})

const estIntrouvable = (erreur: unknown): boolean =>
  axios.isAxiosError(erreur) && erreur.response?.status === 404

export const lireLaPresenceDuContact: LireLaPresenceDuContact = async (
  courriel,
) => {
  if (!brevoActif()) return success({ _tag: 'Introuvable' })
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
