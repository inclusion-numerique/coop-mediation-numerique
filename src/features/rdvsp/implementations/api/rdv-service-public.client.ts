import axios, { type AxiosRequestConfig } from 'axios'
import type { z } from 'zod'
import {
  type Failure,
  failure,
  messageDe,
  type Result,
  success,
} from '@/libraries/result'
import type { CompteRdvUtilisable } from '../../domain/compte/compte-rdv'
import {
  type JetonsOAuth,
  jetonsARenouveler,
} from '../../domain/compte/jetons-oauth'
import {
  AccesRefuse,
  AgentSupprime,
  ApiIndisponible,
  type ErreurRdvApi,
  JetonRevoque,
  RdvIntrouvable,
  ReponseInattendue,
} from '../../domain/errors'
import type { OrganisationId } from '../../domain/identifiants/organisation-id'
import type { RdvAgentId } from '../../domain/identifiants/rdv-agent-id'
import type { RdvId } from '../../domain/identifiants/rdv-id'
import type { UsagerId } from '../../domain/identifiants/usager-id'
import type {
  FiltresRdvs,
  FiltresUsagers,
  RdvServicePublicApi,
} from '../../domain/ports'
import type { DemandeRdv } from '../../domain/rdv/demande-rdv'
import { StatutPresence } from '../../domain/rdv/statut-presence'
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
} from './rdv-service-public.payload'
import {
  agentToDomain,
  demandeRdvToDomain,
  jetonsToDomain,
  organisationToDomain,
  rdvToDomain,
  usagerToDomain,
  webhookToDomain,
} from './rdv-service-public.transfer'

export type RdvServicePublicApiConfig = {
  readonly hostname: string
  readonly clientId: string
  readonly clientSecret: string
  readonly webhookUrl: string
  readonly webhookSecret: string
  readonly onJetonsRenouveles?: (
    agentId: RdvAgentId,
    jetons: JetonsOAuth,
  ) => Promise<void>
  readonly jetonsCourants?: (agentId: RdvAgentId) => Promise<JetonsOAuth | null>
  readonly maintenant?: () => Date
}

type Requete = {
  readonly chemin: string
  readonly methode: 'GET' | 'POST' | 'PATCH'
  readonly params?: Record<string, unknown>
  readonly corps?: unknown
  readonly organisationId?: OrganisationId
}

const cheminsDuCompte: readonly string[] = ['/agents/me', '/organisations']

const erreurDe = (
  agentId: RdvAgentId | null,
  { chemin, organisationId }: Requete,
  erreur: unknown,
): ErreurRdvApi => {
  const statusCode = axios.isAxiosError(erreur)
    ? (erreur.response?.status ?? 0)
    : 0

  if (statusCode === 401) {
    return JetonRevoque(agentId)
  }

  if (statusCode === 404 && cheminsDuCompte.includes(chemin)) {
    return AgentSupprime(chemin)
  }

  return statusCode === 403
    ? AccesRefuse(chemin, organisationId ?? null)
    : ApiIndisponible(statusCode === 0 ? 500 : statusCode, messageDe(erreur))
}

const analyser = <T>(
  schema: z.ZodType<T, unknown>,
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
      return failure(JetonRevoque(compte.agentId))
    }
  }

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
    requete: Requete,
    agentId: RdvAgentId | null,
  ): Promise<Result<unknown, ErreurRdvApi>> => {
    const { chemin, methode, params, corps } = requete
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
      return failure(erreurDe(agentId, requete, erreur))
    }
  }

  const appeler = async <T>(
    compte: CompteRdvUtilisable,
    requete: Requete,
    schema: z.ZodType<T, unknown>,
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

  const executer = async <T>(
    compte: CompteRdvUtilisable,
    requete: Requete,
    schema: z.ZodType<T, unknown>,
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

  const collecter = async <
    Page extends { readonly meta: { readonly next_page: number | null } },
    Element,
  >(
    compte: CompteRdvUtilisable,
    requete: Requete,
    schema: z.ZodType<Page, unknown>,
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

      const requetes: readonly Requete[] =
        organisations.length === 0
          ? [{ chemin: '/rdvs', methode: 'GET', params }]
          : organisations.map((organisationId) => ({
              chemin: '/rdvs',
              methode: 'GET',
              params: { ...params, organisation_id: organisationId },
              organisationId,
            }))

      const resultats = await Promise.all(
        requetes.map((requete) =>
          collecter(
            compte,
            requete,
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
          ...(filtres.ids ? { params: { ids: [...filtres.ids] } } : {}),
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
          organisationId,
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
          organisationId,
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
          organisationId,
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
