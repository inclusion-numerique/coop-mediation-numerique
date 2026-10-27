import {
  createCompositeCursor,
  cursorListMeta,
  cursorPageHref,
  JsonApiCursorPaginationQueryParamsValidation,
  parseCompositeCursor,
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
  inventaireDesLieux,
  lieuInventorie,
  type StructureAttributes,
} from '@app/web/features/lieux-activite/abilities/inventorier-les-lieux'
import { routeBuilder } from '@arckit/nextjs/route'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     Structure:
 *       type: object
 *       required: [type, id, attributes]
 *       properties:
 *         type:
 *           type: string
 *           example: "structure"
 *           enum: [structure]
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         attributes:
 *           type: object
 *           required:
 *             - id_pg
 *             - structure_cartographie_nationale_id
 *             - creation
 *             - modification
 *             - suppression
 *             - nom
 *             - adresse
 *             - commune
 *             - code_postal
 *             - code_insee
 *             - complement_adresse
 *             - latitude
 *             - longitude
 *             - siret
 *             - rna
 *             - visible_pour_cartographie_nationale
 *             - typologies
 *             - presentation_resume
 *             - presentation_detail
 *             - site_web
 *             - telephone
 *             - courriels
 *             - fiche_acces_libre
 *             - horaires
 *             - prise_rdv
 *             - services
 *             - publics_specifiquement_adresses
 *             - prise_en_charge_specifique
 *             - frais_a_charge
 *             - dispositif_programmes_nationaux
 *             - formations_labels
 *             - autres_formations_labels
 *             - itinerance
 *             - modalites_acces
 *             - modalites_accompagnement
 *           properties:
 *             id_pg:
 *               type: integer
 *               nullable: true
 *               description: identifiant postgres v1 de la structure (si importée depuis v1)
 *               example: 12345
 *             structure_cartographie_nationale_id:
 *               type: string
 *               nullable: true
 *               description: identifiant éventuel carto nationale
 *               example: "abcdef12-3456-7890-abcd-ef1234567890"
 *             creation:
 *               type: string
 *               format: date-time
 *               example: "2023-12-10T12:00:00Z"
 *             modification:
 *               type: string
 *               format: date-time
 *               description: "date de la dernière écriture sur ce lieu, quelle qu'en soit la source : la coop, la cartographie nationale ou Mon Inclusion Numérique"
 *               example: "2023-12-10T15:00:00Z"
 *             suppression:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: date de suppression (si la structure est supprimée)
 *               example: "2024-01-05T10:00:00Z"
 *             nom:
 *               type: string
 *               description: nom de la structure
 *               example: "ma structure"
 *             adresse:
 *               type: string
 *               description: adresse complète
 *               example: "123 rue du test"
 *             commune:
 *               type: string
 *               description: commune
 *               example: "Lyon"
 *             code_postal:
 *               type: string
 *               description: code postal
 *               example: "69007"
 *             code_insee:
 *               type: string
 *               nullable: true
 *               description: code INSEE
 *               example: "69123"
 *             complement_adresse:
 *               type: string
 *               nullable: true
 *               description: complément d'adresse
 *               example: "bâtiment b"
 *             latitude:
 *               type: number
 *               nullable: true
 *               description: latitude
 *               example: 45.123456
 *             longitude:
 *               type: number
 *               nullable: true
 *               description: longitude
 *               example: 4.987654
 *             siret:
 *               type: string
 *               nullable: true
 *               example: "12345678901234"
 *             rna:
 *               type: string
 *               nullable: true
 *               example: "W123456789"
 *             visible_pour_cartographie_nationale:
 *               type: boolean
 *               description: structure affichée dans la cartographie nationale
 *               example: true
 *             typologies:
 *               type: array
 *               description: typologies
 *               items:
 *                 type: string
 *                 example: "association"
 *             presentation_resume:
 *               type: string
 *               nullable: true
 *               description: texte de présentation court
 *               example: "lieu de formation"
 *             presentation_detail:
 *               type: string
 *               nullable: true
 *               description: présentation détaillée
 *               example: "beaucoup de services numériques sur place"
 *             site_web:
 *               type: string
 *               nullable: true
 *               description: url du site
 *               example: "https://exemple.org"
 *             telephone:
 *               type: string
 *               nullable: true
 *               example: "0612345678"
 *             courriels:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "contact@exemple.org"
 *             fiche_acces_libre:
 *               type: string
 *               nullable: true
 *               description: url vers la fiche d'accès
 *               example: "https://exemple.org/fiche"
 *             horaires:
 *               type: string
 *               nullable: true
 *               example: "lundi-vendredi 9h-17h"
 *             prise_rdv:
 *               type: string
 *               nullable: true
 *               description: url vers la prise de rendez-vous
 *               example: "https://exemple.org/rdv"
 *             services:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "aide-administrative"
 *             publics_specifiquement_adresses:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "senior"
 *             prise_en_charge_specifique:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "handicap"
 *             frais_a_charge:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "adhesion"
 *             dispositif_programmes_nationaux:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "france_relay"
 *             formations_labels:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "pix"
 *             autres_formations_labels:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "label ABC"
 *             itinerance:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "bus-numerique"
 *             modalites_acces:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "libre"
 *             modalites_accompagnement:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "en_personne"
 *             mediateurs_en_activite:
 *               type: integer
 *               example: 1
 *             emplois:
 *               type: integer
 *               example: 1
 * /structures:
 *   get:
 *     summary: liste des structures
 *     description: >
 *       retourne la liste des structures utilisées dans la coop.
 *
 *       les structures sont triées par date de création décroissante.
 *     tags:
 *       - Structures
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
 *         name: ids
 *         schema:
 *           type: string
 *           description: |
 *             Liste d'identifiants de structures (uuid) séparés par des virgules. Exemple : ids=uuid1,uuid2. Maximum 100 ids.
 *         required: false
 *       - in: query
 *         name: filter[creation][depuis]
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T00:00:00Z"
 *         required: false
 *         description: "retourne les structures avec une date de création supérieure ou égale à cette date-heure"
 *       - in: query
 *         name: filter[modification][depuis]
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T00:00:00Z"
 *         required: false
 *         description: "retourne les structures dont la dernière écriture, quelle qu'en soit la source, est supérieure ou égale à cette date-heure"
 *     responses:
 *       200:
 *         description: liste des structures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [data, links, meta]
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Structure'
 *                 links:
 *                   $ref: '#/components/schemas/PaginationLinks'
 *                 meta:
 *                   $ref: '#/components/schemas/ListMetadata'
 */

export type StructureResource = JsonApiResource<
  'structure',
  StructureAttributes,
  never
>

export type StructureListResponse = JsonApiListResponse<StructureResource>

const StructuresQueryParamsValidation =
  JsonApiCursorPaginationQueryParamsValidation.extend({
    ids: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((v) => (Array.isArray(v) ? v : v ? v.split(',') : []))
      .transform((arr) => arr.map((s) => s.trim()).filter(Boolean))
      .transform((arr) => Array.from(new Set(arr)))
      .pipe(z.array(z.guid()).max(100))
      .default([]),
    filter: z
      .object({
        creation: z
          .object({ depuis: z.iso.datetime().optional() })
          .prefault({}),
        modification: z
          .object({ depuis: z.iso.datetime().optional() })
          .prefault({}),
      })
      .prefault({}),
  })

const StructureCursorValidation = z.object({
  creation_id: z.object({
    creation: z.coerce.string().pipe(z.iso.datetime()),
    id: z.guid(),
  }),
})

const dateDepuis = (depuis: string | undefined): Date | undefined =>
  depuis ? new Date(depuis) : undefined

const requeteDesStructures = ({
  ids,
  creationDepuis,
  modificationDepuis,
}: {
  ids: string[]
  creationDepuis: string | undefined
  modificationDepuis: string | undefined
}): string =>
  new URLSearchParams([
    ...(ids.length > 0 ? [['ids', ids.join(',')]] : []),
    ...(creationDepuis ? [['filter[creation][depuis]', creationDepuis]] : []),
    ...(modificationDepuis
      ? [['filter[modification][depuis]', modificationDepuis]]
      : []),
  ]).toString()

export const GET = routeBuilder()
  .use(withClientApi(['Structures']))
  .use(withQueryParams(StructuresQueryParamsValidation))
  .handle(
    withApiV1Errors(async ({ queryParams }) => {
      const cursorPagination = prismaCursorPagination(queryParams)
      const { ids } = queryParams
      const creationDepuis = queryParams.filter.creation.depuis
      const modificationDepuis = queryParams.filter.modification.depuis

      const parsedCursor = cursorPagination.cursor
        ? parseCompositeCursor(cursorPagination.cursor)
        : undefined
      const validatedCursor = parsedCursor
        ? StructureCursorValidation.parse({
            creation_id: { creation: parsedCursor[0], id: parsedCursor[1] },
          })
        : undefined

      const { lieux, totalCount } = await inventaireDesLieux({
        ids,
        creeDepuis: dateDepuis(creationDepuis),
        modifieDepuis: dateDepuis(modificationDepuis),
        take: cursorPagination.take,
        skip: cursorPagination.skip,
        curseur: validatedCursor?.creation_id,
      })

      const lastItem = lieux.at(-1)
      const firstItem = lieux.at(0)
      const nextCursor =
        lieux.length === cursorPagination.take && lastItem
          ? createCompositeCursor(lastItem.creation.toISOString(), lastItem.id)
          : undefined
      const previousCursor =
        parsedCursor && firstItem
          ? createCompositeCursor(
              firstItem.creation.toISOString(),
              firstItem.id,
            )
          : undefined

      const query = requeteDesStructures({
        ids,
        creationDepuis,
        modificationDepuis,
      })

      return NextResponse.json({
        data: lieux.map((lieu) => ({
          type: 'structure' as const,
          id: lieu.id,
          attributes: lieuInventorie(lieu),
        })),
        links: {
          self: {
            href: cursorPageHref('/structures', {
              cursor: cursorPagination.cursor
                ? {
                    direction: cursorPagination.isBefore ? 'before' : 'after',
                    value: cursorPagination.cursor,
                  }
                : undefined,
              query,
            }),
          },
          next: nextCursor
            ? {
                href: cursorPageHref('/structures', {
                  cursor: { direction: 'after', value: nextCursor },
                  query,
                }),
              }
            : undefined,
          prev: previousCursor
            ? {
                href: cursorPageHref('/structures', {
                  cursor: { direction: 'before', value: previousCursor },
                  query,
                }),
              }
            : undefined,
        },
        meta: cursorListMeta({
          totalCount,
          take: cursorPagination.take,
          nextCursor,
          previousCursor,
        }),
      } satisfies StructureListResponse)
    }),
  )
