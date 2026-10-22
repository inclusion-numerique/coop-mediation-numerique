import { apiV1Url } from '@app/web/app/api/v1/apiV1Url'
import {
  createCompositeCursor,
  JsonApiCursorPaginationQueryParamsValidation,
  parseCompositeCursor,
  prismaCursorPagination,
} from '@app/web/app/api/v1/CursorPagination'
import { createApiV1Route } from '@app/web/app/api/v1/createApiV1Route'
import type {
  JsonApiListResponse,
  JsonApiResource,
} from '@app/web/app/api/v1/JsonApiTypes'
import {
  criteresDExposition,
  type UtilisateurAttributes,
  utilisateurExpose,
  utilisateursExposes,
} from '@app/web/features/utilisateurs/abilities/exposer-les-utilisateurs'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     Utilisateur:
 *       type: object
 *       required: [type, id, attributes]
 *       properties:
 *         type:
 *           type: string
 *           example: "utilisateur"
 *           enum: [utilisateur]
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         attributes:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "john.doe@example.org"
 *             prenom:
 *               type: string
 *               nullable: true
 *               example: "john"
 *             nom:
 *               type: string
 *               nullable: true
 *               example: "doe"
 *             inscription_validee:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               example: "2024-01-05T10:00:00Z"
 *             telephone:
 *               type: string
 *               nullable: true
 *               example: "+33123456789"
 *             creation:
 *               type: string
 *               format: date-time
 *               example: "2024-01-01T12:00:00Z"
 *             modification:
 *               type: string
 *               format: date-time
 *               example: "2024-01-02T12:00:00Z"
 *             suppression:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               example: "2024-01-03T12:00:00Z"
 *             dataspace_id:
 *               type: number
 *               nullable: true
 *               description: identifiant dataspace de l'utilisateur
 *               example: 67890
 *             emplois:
 *               type: array
 *               description: employeuses courantes (affectations actives dans main.personne_affectations_emploi) avec l'id de l'affectation et l'id de la structure employeuse (main.structure_administrative). Dates best-effort depuis main.contrat.
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: identifiant de l'affectation emploi (main)
 *                   structure_id:
 *                     type: integer
 *                     nullable: true
 *                     description: identifiant de la structure employeuse dans main.structure_administrative (entier)
 *                   debut:
 *                     type: string
 *                     format: date-time
 *                     description: date de début de l'emploi dans la structure
 *                   fin:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     description: date de fin de l'emploi dans la structure
 *                   creation:
 *                     type: string
 *                     format: date-time
 *                   modification:
 *                     type: string
 *                     format: date-time
 *                   suppression:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *             mediateur:
 *               type: object
 *               nullable: true
 *               description: données du médiateur
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 creation:
 *                   type: string
 *                   format: date-time
 *                 modification:
 *                   type: string
 *                   format: date-time
 *                 is_visible:
 *                   type: boolean
 *                   description: indique si le médiateur consent à la diffusion publique de ses informations
 *                 en_activite:
 *                   type: array
 *                   description: liste des liens mediateur-structure (uniquement l'id, structure_id...)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       structure_id:
 *                         type: string
 *                         format: uuid
 *                       debut:
 *                         type: string
 *                         format: date-time
 *                         description: date de début de l'activité dans la structure
 *                       fin:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         description: date de fin de l'activité dans la structure
 *                       creation:
 *                         type: string
 *                         format: date-time
 *                       modification:
 *                         type: string
 *                         format: date-time
 *                       suppression:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                 coordinations:
 *                   type: array
 *                   description: liste des mediateurs_coordonnes
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       creation:
 *                         type: string
 *                         format: date-time
 *                       modification:
 *                         type: string
 *                         format: date-time
 *                       suppression:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       coordinateur_id:
 *                         type: string
 *                         format: uuid
 *             coordinateur:
 *               type: object
 *               nullable: true
 *               description: données du coordinateur
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 creation:
 *                   type: string
 *                   format: date-time
 *                 modification:
 *                   type: string
 *                   format: date-time
 *                 mediateurs_coordonnes:
 *                   type: array
 *                   description: liste des mediateurs_coordonnes
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       creation:
 *                         type: string
 *                         format: date-time
 *                       modification:
 *                         type: string
 *                         format: date-time
 *                       suppression:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       mediateur_id:
 *                         type: string
 *                         format: uuid
 *             conseiller_numerique:
 *               type: object
 *               description: informations relatives au dispositif "conseiller numerique"
 *               required:
 *                 - is_conseiller_numerique
 *                 - id_pg
 *               properties:
 *                 is_conseiller_numerique:
 *                   type: boolean
 *                   description: indique si l utilisateur est dans le dispositif "conseiller numerique"
 *                   example: true
 *                 id_pg:
 *                   type: number
 *                   nullable: true
 *                   description: identifiant pg de l utilisateur dans le dispositif "conseiller numerique"
 *                   example: 12345
 * /utilisateurs:
 *   get:
 *     summary: liste des utilisateurs
 *     description: >
 *       Retourne la liste des utilisateurs dont l'inscription est terminée, ainsi que
 *       ceux qui ont déjà saisi au moins une activité.
 *       Les utilisateurs sont triés par date de création décroissante.
 *     tags:
 *       - Utilisateurs
 *     parameters:
 *       - in: query
 *         name: page[size]
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 500
 *         required: false
 *         description: nombre maximum d'éléments à retourner
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
 *       - in: query
 *         name: filter[soft_deleted]
 *         schema:
 *           type: string
 *           enum: ['0', '1']
 *         required: false
 *         description: exclure les elements soft-deleted, ce qui permet de ne pas inclure les utilisateurs et leur données rattachées qui ne sont plus d’actualité. '0' pour exclure les utilisateurs supprimés, '1' pour inclure les utilisateurs supprimés uniquement
 *       - in: query
 *         name: filter[conseiller_numerique]
 *         schema:
 *           type: string
 *           enum: ['0', '1']
 *         required: false
 *         description: filtre sur le statut conseiller numérique. '0' pour les non-conseillers numériques, '1' pour les conseillers numériques
 *       - in: query
 *         name: filter[conseiller_numerique_id_pg]
 *         schema:
 *            type: string
 *         required: false
 *         description: filtre sur l'identifiant pg du conseiller numérique, plusieurs valeurs sont possibles séparées par des virgules
 *         examples:
 *           single:
 *             summary: une seule valeur
 *             value: "123"
 *           multiple:
 *             summary: plusieurs valeurs
 *             value: "123,456,789"
 *       - in: query
 *         name: filter[dataspace_id]
 *         schema:
 *            type: string
 *         required: false
 *         description: filtre sur l'identifiant dataspace, plusieurs valeurs sont possibles séparées par des virgules
 *         examples:
 *           single:
 *             summary: une seule valeur
 *             value: "123"
 *           multiple:
 *             summary: plusieurs valeurs
 *             value: "123,456,789"
 *     responses:
 *       200:
 *         description: liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [data, links, meta]
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Utilisateur'
 *                 links:
 *                   $ref: '#/components/schemas/PaginationLinks'
 *                 meta:
 *                   $ref: '#/components/schemas/ListMetadata'
 */

export type { UtilisateurAttributes }

export type UtilisateurResource = JsonApiResource<
  'utilisateur',
  UtilisateurAttributes,
  never
>

export type UtilisateurListResponse = JsonApiListResponse<UtilisateurResource>

const CurseurValidation = z.object({
  created: z.coerce.string().pipe(z.iso.datetime()),
  id: z.guid(),
})

const lienDePage = (
  sens: 'after' | 'before',
  curseur: string,
): { readonly href: string } => ({
  href: apiV1Url(
    `/utilisateurs?page[${sens}]=${encodeSerializableState(curseur)}`,
  ),
})

export const GET = createApiV1Route
  .configure<UtilisateurListResponse>({
    scopes: ['Utilisateurs'],
  })
  .queryParams(
    JsonApiCursorPaginationQueryParamsValidation.extend({
      filter: z
        .object({
          conseiller_numerique: z
            .union([z.literal('0'), z.literal('1')])
            .optional(),
          conseiller_numerique_id_pg: z
            .union([z.string(), z.array(z.string())])
            .optional()
            .transform((value) =>
              typeof value === 'string' ? [value] : value,
            ),
          dataspace_id: z
            .union([z.string(), z.array(z.string())])
            .optional()
            .transform((value) =>
              typeof value === 'string' ? [value] : value,
            ),
          soft_deleted: z.union([z.literal('0'), z.literal('1')]).optional(),
        })
        .prefault({}),
    }),
  )
  .handle(async ({ params }) => {
    const pagination = prismaCursorPagination(params)
    const curseurLu = pagination.cursor
      ? parseCompositeCursor(pagination.cursor)
      : undefined
    const curseur = curseurLu
      ? CurseurValidation.parse({ created: curseurLu[0], id: curseurLu[1] })
      : null

    const { utilisateurs, total } = await utilisateursExposes({
      criteres: criteresDExposition(params.filter),
      take: pagination.take,
      skip: pagination.skip,
      cursor: curseur,
    })

    const dernier = utilisateurs.at(-1)
    const premier = utilisateurs.at(0)
    const suivant = dernier
      ? createCompositeCursor(dernier.created.toISOString(), dernier.id)
      : undefined
    const precedent =
      curseurLu && premier
        ? createCompositeCursor(premier.created.toISOString(), premier.id)
        : undefined

    return NextResponse.json({
      data: utilisateurs.map((utilisateur) => ({
        type: 'utilisateur' as const,
        id: utilisateur.id,
        attributes: utilisateurExpose(utilisateur),
      })),
      links: {
        self: pagination.cursor
          ? lienDePage(
              pagination.isBefore ? 'before' : 'after',
              pagination.cursor,
            )
          : { href: apiV1Url('/utilisateurs') },
        next: suivant ? lienDePage('after', suivant) : undefined,
        prev: precedent ? lienDePage('before', precedent) : undefined,
      },
      meta: {
        total_count: total,
        items_per_page: pagination.take,
        total_pages: Math.ceil(total / pagination.take),
        has_next_page: !!suivant,
        has_prev_page: !!precedent,
      },
    } satisfies UtilisateurListResponse)
  })
