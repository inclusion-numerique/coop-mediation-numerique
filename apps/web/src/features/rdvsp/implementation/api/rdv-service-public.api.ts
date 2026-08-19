import {
  type Failure,
  failure,
  type Result,
  success,
} from '@app/web/libraries/result'
import axios, { type AxiosRequestConfig } from 'axios'
import type { z } from 'zod'
import type { CompteRdvUtilisable } from '../../domain/compte-rdv'
import type { DemandeRdv } from '../../domain/demande-rdv'
import {
  ApiIndisponible,
  type ErreurRdvApi,
  JetonRevoque,
  RdvIntrouvable,
  ReponseInattendue,
} from '../../domain/errors'
import { type JetonsOAuth, jetonsARenouveler } from '../../domain/jetons-oauth'
import type { OrganisationId } from '../../domain/organisation-id'
import type { RdvAgentId } from '../../domain/rdv-agent-id'
import type { RdvId } from '../../domain/rdv-id'
import type {
  FiltresRdvs,
  FiltresUsagers,
  RdvServicePublicApi,
} from '../../domain/rdv-service-public.port'
import { StatutPresence } from '../../domain/statut-presence'
import type { UsagerId } from '../../domain/usager-id'
import type { AbonnementWebhook, WebhookId } from '../../domain/webhook'
import {
  demandeRdvPayload,
  jetonsPayload,
  mePayload,
  organisationsPagePayload,
  rdvsPagePayload,
  statutRdvPayload,
  usagersPagePayload,
  usagerUniquePayload,
  webhooksPagePayload,
  webhookUniquePayload,
} from './payloads'
import {
  agentToDomain,
  demandeRdvToDomain,
  jetonsToDomain,
  organisationToDomain,
  rdvToDomain,
  usagerToDomain,
  webhookToDomain,
} from './to-domain'

export type RdvServicePublicApiConfig = {
  readonly hostname: string
  readonly clientId: string
  readonly clientSecret: string
  /**
   * URL que RDV Service Public appellera, et secret dont il signe ses envois.
   * Ils identifient La Coop comme destination des notifications : le port n'a
   * pas à les porter, c'est cette implémentation qui est cette destination.
   */
  readonly webhookUrl: string
  readonly webhookSecret: string
  /**
   * Notifié après un renouvellement réussi. L'adaptateur ne connaît pas la base :
   * c'est à l'appelant d'enregistrer les nouveaux jetons, et lui seul sait s'il
   * doit le faire dans la transaction en cours.
   */
  readonly onJetonsRenouveles?: (
    agentId: RdvAgentId,
    jetons: JetonsOAuth,
  ) => Promise<void>
  /**
   * Jetons que porte l'enregistrement du compte, à l'instant de l'appel.
   *
   * Sans elle, l'adaptateur repart des jetons figés dans le compte qu'on lui
   * passe. Or une passe de synchronisation lit ce compte une fois et le promène
   * d'une étape à l'autre, pendant que chaque renouvellement en écrit de
   * nouveaux : le deuxième appel rejouait donc un échange avec un jeton de
   * rafraîchissement que RDV Service Public venait de faire tourner, se le
   * faisait refuser, et emportait la passe entière.
   */
  readonly jetonsCourants?: (agentId: RdvAgentId) => Promise<JetonsOAuth | null>
  /** Injectable pour les tests ; par défaut l'horloge système. */
  readonly maintenant?: () => Date
}

type Requete = {
  readonly chemin: string
  readonly methode: 'GET' | 'POST' | 'PATCH'
  readonly params?: Record<string, unknown>
  readonly corps?: unknown
}

const messageDe = (erreur: unknown): string =>
  axios.isAxiosError(erreur)
    ? erreur.message
    : erreur instanceof Error
      ? erreur.message
      : 'Erreur inconnue'

/**
 * Un 401 ne devient `JetonRevoque` qu'après l'unique nouvelle tentative : tant
 * qu'un renouvellement reste possible, l'échec est réputé transitoire.
 */
const erreurDe = (
  agentId: RdvAgentId | null,
  erreur: unknown,
): ErreurRdvApi => {
  const statusCode = axios.isAxiosError(erreur)
    ? (erreur.response?.status ?? 0)
    : 0

  return statusCode === 401
    ? JetonRevoque(agentId)
    : ApiIndisponible(statusCode === 0 ? 500 : statusCode, messageDe(erreur))
}

const analyser = <T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  chemin: string,
  donnees: unknown,
): Result<T, ErreurRdvApi> => {
  const resultat = schema.safeParse(donnees)

  return resultat.success
    ? success(resultat.data)
    : failure(
        ReponseInattendue(
          chemin,
          resultat.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join(' ; '),
        ),
      )
}

export const rdvServicePublicApi = ({
  hostname,
  clientId,
  clientSecret,
  webhookUrl,
  webhookSecret,
  onJetonsRenouveles,
  jetonsCourants,
  maintenant = () => new Date(),
}: RdvServicePublicApiConfig): RdvServicePublicApi => {
  /**
   * Jetons à utiliser pour le prochain appel. Ceux de la base font foi ; ceux du
   * compte reçu ne servent que de repli, quand aucune lecture n'est branchée.
   */
  const jetonsAJour = async (
    compte: CompteRdvUtilisable,
  ): Promise<JetonsOAuth> =>
    (await jetonsCourants?.(compte.agentId)) ?? compte.jetons

  const echangerRefreshToken = async (
    compte: CompteRdvUtilisable,
    jetonsUtilises: JetonsOAuth,
  ): Promise<Result<JetonsOAuth, ErreurRdvApi>> => {
    const { rafraichissement } = jetonsUtilises

    if (rafraichissement === null) {
      return failure(JetonRevoque(compte.agentId))
    }

    try {
      const reponse = await axios.post(
        `https://${hostname}/oauth/token`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: rafraichissement,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )

      const analyse = analyser(jetonsPayload, '/oauth/token', reponse.data)

      if (!analyse.success) {
        return analyse
      }

      const jetons = jetonsToDomain(analyse.data, jetonsUtilises, maintenant())

      await onJetonsRenouveles?.(compte.agentId, jetons)

      return success(jetons)
    } catch {
      // Un refresh_token refusé est définitif : il faut une reconnexion OAuth.
      return failure(JetonRevoque(compte.agentId))
    }
  }

  /**
   * Renouvelle, et rattrape la course.
   *
   * Deux appels partis en parallèle avec le même jeton de rafraîchissement ne
   * peuvent pas réussir tous les deux : le premier le consomme, le second se
   * fait refuser. Le perdant relit alors les jetons du compte — s'ils ont changé,
   * c'est que l'autre a fait le travail, et son refus n'est pas une révocation.
   *
   * C'est ce qui remplace un verrou : rien à partager, rien à mutualiser, la base
   * arbitre.
   */
  const renouveler = async (
    compte: CompteRdvUtilisable,
    jetons: JetonsOAuth,
  ): Promise<Result<JetonsOAuth, ErreurRdvApi>> => {
    const echange = await echangerRefreshToken(compte, jetons)

    if (echange.success) {
      return echange
    }

    const courants = await jetonsCourants?.(compte.agentId)

    return courants !== undefined &&
      courants !== null &&
      courants.acces !== jetons.acces
      ? success(courants)
      : echange
  }

  const requeteHttp = async (
    jetons: JetonsOAuth,
    { chemin, methode, params, corps }: Requete,
    agentId: RdvAgentId | null,
  ): Promise<Result<unknown, ErreurRdvApi>> => {
    const config: AxiosRequestConfig = {
      url: `https://${hostname}/api/v1${chemin}`,
      method: methode,
      headers: { Authorization: `Bearer ${jetons.acces}` },
      params,
      data: corps,
    }

    try {
      const reponse = await axios(config)
      return success(reponse.data)
    } catch (erreur) {
      return failure(erreurDe(agentId, erreur))
    }
  }

  const appeler = async <T>(
    compte: CompteRdvUtilisable,
    requete: Requete,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    jetons: JetonsOAuth,
    renouvellementPossible: boolean,
  ): Promise<Result<T, ErreurRdvApi>> => {
    const reponse = await requeteHttp(jetons, requete, compte.agentId)

    if (reponse.success) {
      return analyser(schema, requete.chemin, reponse.data)
    }

    if (reponse.error._tag !== 'JetonRevoque' || !renouvellementPossible) {
      return failure(reponse.error)
    }

    const renouveles = await renouveler(compte, jetons)

    if (!renouveles.success) {
      return renouveles
    }

    return await appeler(compte, requete, schema, renouveles.data, false)
  }

  /**
   * Renouvelle par anticipation quand l'expiration est connue et proche, pour
   * éviter un aller-retour 401 systématique en fin de validité.
   */
  const executer = async <T>(
    compte: CompteRdvUtilisable,
    requete: Requete,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  ): Promise<Result<T, ErreurRdvApi>> => {
    const jetons = await jetonsAJour(compte)

    if (!jetonsARenouveler(jetons, maintenant())) {
      return await appeler(compte, requete, schema, jetons, true)
    }

    const renouveles = await renouveler(compte, jetons)

    return renouveles.success
      ? await appeler(compte, requete, schema, renouveles.data, false)
      : renouveles
  }

  /**
   * Parcourt les pages jusqu'à épuisement. La récursion porte l'accumulateur :
   * une boucle demanderait une variable mutable, et le nombre de pages reste de
   * l'ordre de la dizaine.
   */
  const collecter = async <
    Page extends { readonly meta: { readonly next_page: number | null } },
    Element,
  >(
    compte: CompteRdvUtilisable,
    requete: Requete,
    schema: z.ZodType<Page, z.ZodTypeDef, unknown>,
    extraire: (page: Page) => readonly Element[],
    premierePageSeulement: boolean,
    page: number,
    acquis: readonly Element[],
  ): Promise<Result<readonly Element[], ErreurRdvApi>> => {
    const reponse = await executer(
      compte,
      { ...requete, params: { ...requete.params, page } },
      schema,
    )

    if (!reponse.success) {
      return reponse
    }

    const cumul = [...acquis, ...extraire(reponse.data)]
    const suivante = reponse.data.meta.next_page

    return premierePageSeulement || suivante === null
      ? success(cumul)
      : await collecter(
          compte,
          requete,
          schema,
          extraire,
          premierePageSeulement,
          suivante,
          cumul,
        )
  }

  return {
    identifierAgent: async (jetons) => {
      // Appel direct : sans agent connu, ni renouvellement ni nouvelle tentative
      // n'auraient de sens — les jetons viennent d'être échangés.
      const reponse = await requeteHttp(
        jetons,
        { chemin: '/agents/me', methode: 'GET' },
        null,
      )

      if (!reponse.success) {
        return reponse
      }

      const analyse = analyser(mePayload, '/agents/me', reponse.data)

      return analyse.success
        ? success(agentToDomain(analyse.data.agent))
        : analyse
    },

    listerOrganisations: async (compte) => {
      const reponse = await collecter(
        compte,
        { chemin: '/organisations', methode: 'GET' },
        organisationsPagePayload,
        (page) => page.organisations,
        false,
        1,
        [],
      )

      return reponse.success
        ? success(reponse.data.map(organisationToDomain))
        : reponse
    },

    listerRdvs: async (compte, filtres: FiltresRdvs = {}) => {
      const params = {
        agent_id: filtres.agentId,
        user_id: filtres.usagerId,
        starts_after: filtres.debutApres?.toISOString(),
        starts_before: filtres.debutAvant?.toISOString(),
      }

      const organisations: readonly OrganisationId[] =
        filtres.organisationIds ?? []

      // Sans organisation ciblée, l'API rend les rendez-vous de l'agent ; sinon
      // il faut une collecte par organisation, l'API n'acceptant qu'un id.
      const requetes =
        organisations.length === 0
          ? [params]
          : organisations.map((organisationId) => ({
              ...params,
              organisation_id: organisationId,
            }))

      const resultats = await Promise.all(
        requetes.map((parametres) =>
          collecter(
            compte,
            { chemin: '/rdvs', methode: 'GET', params: parametres },
            rdvsPagePayload,
            (page) => page.rdvs,
            filtres.premierePageSeulement ?? false,
            1,
            [],
          ),
        ),
      )

      const echec = resultats.find(
        (resultat): resultat is Failure<ErreurRdvApi> => !resultat.success,
      )

      if (echec) {
        return echec
      }

      return success(
        resultats
          .flatMap((resultat) => (resultat.success ? resultat.data : []))
          .map((payload) => ({
            rdv: rdvToDomain(payload, compte.agentId),
            brut: payload,
          })),
      )
    },

    listerUsagers: async (compte, filtres: FiltresUsagers = {}) => {
      const reponse = await collecter(
        compte,
        {
          chemin: '/users',
          methode: 'GET',
          params: filtres.ids ? { ids: [...filtres.ids] } : undefined,
        },
        usagersPagePayload,
        (page) => page.users,
        filtres.premierePageSeulement ?? false,
        1,
        [],
      )

      return reponse.success
        ? success(reponse.data.map(usagerToDomain))
        : reponse
    },

    recupererUsager: async (compte, id: UsagerId) => {
      const reponse = await executer(
        compte,
        { chemin: `/users/${id}`, methode: 'GET' },
        usagerUniquePayload,
      )

      if (!reponse.success) {
        return reponse.error._tag === 'ApiIndisponible' &&
          reponse.error.statusCode === 404
          ? success(null)
          : reponse
      }

      return success(
        reponse.data.user === null ? null : usagerToDomain(reponse.data.user),
      )
    },

    creerDemandeRdv: async (compte, demande: DemandeRdv) => {
      const usager =
        demande.usager._tag === 'existant'
          ? { id: demande.usager.id }
          : {
              first_name: demande.usager.prenom ?? undefined,
              last_name: demande.usager.nom ?? undefined,
              email: demande.usager.email ?? undefined,
              phone_number: demande.usager.telephone ?? undefined,
              address: demande.usager.adresse ?? undefined,
              birth_date: demande.usager.dateNaissance
                ?.toISOString()
                .slice(0, 10),
            }

      const reponse = await executer(
        compte,
        {
          chemin: '/rdv_plans',
          methode: 'POST',
          corps: {
            user: usager,
            return_url: demande.urlRetour ?? undefined,
            dossier_url: demande.urlDossier ?? undefined,
          },
        },
        demandeRdvPayload,
      )

      return reponse.success
        ? success(demandeRdvToDomain(reponse.data))
        : reponse
    },

    changerStatutRdv: async (compte, id: RdvId, statut) => {
      const reponse = await executer(
        compte,
        {
          chemin: `/rdvs/${id}/update_status`,
          methode: 'PATCH',
          corps: { status: statut },
        },
        statutRdvPayload,
      )

      if (!reponse.success) {
        return reponse.error._tag === 'ApiIndisponible' &&
          reponse.error.statusCode === 404
          ? failure(RdvIntrouvable(id))
          : reponse
      }

      return success(StatutPresence(reponse.data.status))
    },

    listerWebhooksDeLaCoop: async (compte, organisationId) => {
      const reponse = await collecter(
        compte,
        {
          chemin: `/organisations/${organisationId}/webhook_endpoints`,
          methode: 'GET',
          params: { target_url: webhookUrl },
        },
        webhooksPagePayload,
        (page) => page.webhook_endpoints,
        false,
        1,
        [],
      )

      if (!reponse.success) {
        return reponse
      }

      // Le filtre `target_url` est passé à l'API, mais on le revérifie : une
      // pose sur le webhook d'un tiers serait irréparable.
      return success(
        reponse.data
          .filter((webhook) => webhook.target_url === webhookUrl)
          .map(webhookToDomain),
      )
    },

    poserWebhook: async (compte, organisationId, abonnements) => {
      const reponse = await executer(
        compte,
        {
          chemin: `/organisations/${organisationId}/webhook_endpoints`,
          methode: 'POST',
          corps: {
            target_url: webhookUrl,
            subscriptions: [...abonnements],
            secret: webhookSecret,
          },
        },
        webhookUniquePayload,
      )

      return reponse.success
        ? success(webhookToDomain(reponse.data.webhook_endpoint))
        : reponse
    },

    reconfigurerWebhook: async (
      compte,
      organisationId,
      webhookId,
      abonnements,
    ) => {
      const reponse = await executer(
        compte,
        {
          chemin: `/organisations/${organisationId}/webhook_endpoints/${webhookId}`,
          methode: 'PATCH',
          corps: {
            target_url: webhookUrl,
            subscriptions: [...abonnements],
            secret: webhookSecret,
          },
        },
        webhookUniquePayload,
      )

      return reponse.success
        ? success(webhookToDomain(reponse.data.webhook_endpoint))
        : reponse
    },

    renouvelerJetons: async (compte) =>
      await renouveler(compte, await jetonsAJour(compte)),
  }
}
