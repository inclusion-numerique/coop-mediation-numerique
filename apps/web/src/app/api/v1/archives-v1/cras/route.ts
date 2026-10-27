import {
  cursorListMeta,
  cursorPageHref,
  JsonApiCursorPaginationQueryParamsValidation,
  prismaCursorPagination,
} from '@app/web/app/api/v1/CursorPagination'
import type {
  JsonApiListResponse,
  JsonApiResource,
} from '@app/web/app/api/v1/JsonApiTypes'
import {
  withApiV1Errors,
  withClientApi,
  withQueryParams,
} from '@app/web/app/api/v1/middlewares'
import {
  type CraV1Attributes,
  crasV1Exposes,
  craV1Expose,
} from '@app/web/features/activites/abilities/exposer-les-cras-v1'
import { routeBuilder } from '@arckit/nextjs/route'
import { NextResponse } from 'next/server'

/**
 * @openapi
 * components:
 *   schemas:
 *     ArchiveCraV1:
 *       type: object
 *       required: [type, id, attributes]
 *       properties:
 *         type:
 *           type: string
 *           example: "craV1"
 *         id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         attributes:
 *           type: object
 *           required:
 *             - imported_at
 *             - conseiller_numerique_id
 *             - canal
 *             - activite
 *             - nb_participants
 *             - nb_participants_recurrents
 *             - age_moins_12_ans
 *             - age_de_12_a_18_ans
 *             - age_de_18_a_35_ans
 *             - age_de_35_a_60_ans
 *             - age_plus_60_ans
 *             - statut_etudiant
 *             - statut_sans_emploi
 *             - statut_en_emploi
 *             - statut_retraite
 *             - statut_heterogene
 *             - themes
 *             - sous_themes_equipement_informatique
 *             - sous_themes_sante
 *             - sous_themes_accompagner
 *             - sous_themes_traitement_texte
 *             - duree
 *             - duree_minutes
 *             - accompagnement_individuel
 *             - accompagnement_atelier
 *             - accompagnement_redirection
 *             - code_postal
 *             - nom_commune
 *             - date_accompagnement
 *             - code_commune
 *             - created_at
 *           properties:
 *             imported_at:
 *               type: string
 *               format: date-time
 *               description: date d'import du cra dans la nouvelle coop
 *             conseiller_numerique_id:
 *               type: string
 *               description: identifiant du conseiller numérique v1
 *             canal:
 *               type: string
 *               description: canal de l'accompagnement
 *             activite:
 *               type: string
 *               description: type d'activité
 *             nb_participants:
 *               type: number
 *               description: nombre total de participants
 *             nb_participants_recurrents:
 *               type: number
 *               description: nombre de participants récurrents
 *             age_moins_12_ans:
 *               type: number
 *               description: nombre de participants de moins de 12 ans
 *             age_de_12_a_18_ans:
 *               type: number
 *               description: nombre de participants entre 12 et 18 ans
 *             age_de_18_a_35_ans:
 *               type: number
 *               description: nombre de participants entre 18 et 35 ans
 *             age_de_35_a_60_ans:
 *               type: number
 *               description: nombre de participants entre 35 et 60 ans
 *             age_plus_60_ans:
 *               type: number
 *               description: nombre de participants de plus de 60 ans
 *             statut_etudiant:
 *               type: number
 *               description: nombre de participants étudiants
 *             statut_sans_emploi:
 *               type: number
 *               description: nombre de participants sans emploi
 *             statut_en_emploi:
 *               type: number
 *               description: nombre de participants en emploi
 *             statut_retraite:
 *               type: number
 *               description: nombre de participants retraités
 *             statut_heterogene:
 *               type: number
 *               description: nombre de participants statut hétérogène
 *             themes:
 *               type: array
 *               items:
 *                 type: string
 *               description: liste des thèmes abordés
 *             sous_themes_equipement_informatique:
 *               type: array
 *               items:
 *                 type: string
 *               description: liste des sous-thèmes d'équipement informatique
 *             sous_themes_sante:
 *               type: array
 *               items:
 *                 type: string
 *               description: liste des sous-thèmes liés à la santé
 *             sous_themes_accompagner:
 *               type: array
 *               items:
 *                 type: string
 *               description: liste des sous-thèmes liés à l'accompagnement
 *             sous_themes_traitement_texte:
 *               type: array
 *               items:
 *                 type: string
 *               description: liste des sous-thèmes liés au traitement de texte
 *             duree:
 *               type: string
 *               description: durée au format lisible (e.g. "1h30")
 *             duree_minutes:
 *               type: number
 *               description: durée en minutes
 *             accompagnement_individuel:
 *               type: number
 *               description: nombre d'accompagnements individuels
 *             accompagnement_atelier:
 *               type: number
 *               description: nombre d'ateliers
 *             accompagnement_redirection:
 *               type: number
 *               description: nombre d'accompagnements en redirection
 *             code_postal:
 *               type: string
 *               description: code postal du lieu d'accompagnement
 *             nom_commune:
 *               type: string
 *               description: nom de la commune
 *             date_accompagnement:
 *               type: string
 *               format: date-time
 *               description: date de l'accompagnement
 *             code_commune:
 *               type: string
 *               description: code commune (INSEE)
 *             organismes:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *               nullable: true
 *               description: objet clé-valeur représentant le nombre d'interactions par organisme
 *             annotation:
 *               type: string
 *               nullable: true
 *               description: commentaire ou annotation complémentaire
 *             created_at:
 *               type: string
 *               format: date-time
 *               description: date de création de l'entrée
 *             updated_at:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: date de dernière mise à jour de l'entrée
 *             structure_id:
 *               type: string
 *               nullable: true
 *               description: identifiant de la structure
 *             structure_id_pg:
 *               type: number
 *               nullable: true
 *               description: identifiant numérique de la structure
 *             structure_type:
 *               type: string
 *               nullable: true
 *               description: type de la structure
 *             structure_statut:
 *               type: string
 *               nullable: true
 *               description: statut de la structure
 *             structure_nom:
 *               type: string
 *               nullable: true
 *               description: nom de la structure
 *             structure_siret:
 *               type: string
 *               nullable: true
 *               description: siret de la structure
 *             structure_code_postal:
 *               type: string
 *               nullable: true
 *               description: code postal de la structure
 *             structure_nom_commune:
 *               type: string
 *               nullable: true
 *               description: nom de commune de la structure
 *             structure_code_commune:
 *               type: string
 *               nullable: true
 *               description: code commune (INSEE) de la structure
 *             structure_code_departement:
 *               type: string
 *               nullable: true
 *               description: code du département
 *             structure_code_region:
 *               type: string
 *               nullable: true
 *               description: code de la région
 *
 * /archives-v1/cras:
 *   get:
 *     summary: liste les cras v1 archivés
 *     description: >
 *       Retourne la liste des cras importés depuis la version 1 de la coop réalisée par
 *       l'équipe du dispositif conseiller-numérique et importés dans cette version de la coop
 *       pour archivage. pour toute question sur les données, veuillez vous adresser à l'équipe
 *       du dispositif conseiller-numérique. les données suivent la spécification json:api.
 *
 *       Les cras sont triés par date de création décroissante
 *     tags:
 *       - Activités
 *     parameters:
 *       - in: query
 *         name: page[size]
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 500
 *         required: false
 *         description: nombre maximum d'éléments à retourner,
 *       - in: query
 *         name: page[after]
 *         schema:
 *           type: string
 *         required: false
 *         description: curseur de pagination pour obtenir les éléments suivants
 *       - in: query
 *         name: page[before]
 *         schema:
 *           type: string
 *         required: false
 *         description: curseur de pagination pour obtenir les éléments précédents
 *     responses:
 *       200:
 *         description: liste de cras v1
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [data, links, meta]
 *               properties:
 *                 jsonapi:
 *                   type: object
 *                   required: [version]
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.0"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ArchiveCraV1'
 *                 links:
 *                   $ref: '#/components/schemas/PaginationLinks'
 *                 meta:
 *                   $ref: '#/components/schemas/ListMetadata'
 */

type CraV1Relationships = 'user'

export type CraV1Resource = JsonApiResource<
  'craV1',
  CraV1Attributes,
  CraV1Relationships
>

export type CraV1ListResponse = JsonApiListResponse<CraV1Resource>

export const GET = routeBuilder()
  .use(withClientApi(['Activites']))
  .use(withQueryParams(JsonApiCursorPaginationQueryParamsValidation))
  .handle(
    withApiV1Errors(async ({ queryParams }) => {
      const cursorPagination = prismaCursorPagination(queryParams)

      const { cras, total } = await crasV1Exposes({
        take: cursorPagination.take,
        skip: cursorPagination.skip,
        creeLe: cursorPagination.cursor,
      })

      const nextCursor = cras.at(-1)?.createdAt.toISOString()
      const previousCursor = cras.at(0)?.createdAt.toISOString()

      return NextResponse.json({
        data: cras.map((cra) => ({
          type: 'craV1' as const,
          id: cra.id,
          attributes: craV1Expose(cra),
        })),
        links: {
          self: {
            href: cursorPageHref('/archives-v1/cras', {
              cursor: cursorPagination.cursor
                ? {
                    direction: cursorPagination.isBefore ? 'before' : 'after',
                    value: cursorPagination.cursor,
                  }
                : undefined,
            }),
          },
          next: nextCursor
            ? {
                href: cursorPageHref('/archives-v1/cras', {
                  cursor: { direction: 'after', value: nextCursor },
                }),
              }
            : undefined,
          prev: previousCursor
            ? {
                href: cursorPageHref('/archives-v1/cras', {
                  cursor: { direction: 'before', value: previousCursor },
                }),
              }
            : undefined,
        },
        meta: cursorListMeta({
          totalCount: total,
          take: cursorPagination.take,
          nextCursor,
          previousCursor,
        }),
      } satisfies CraV1ListResponse)
    }),
  )
