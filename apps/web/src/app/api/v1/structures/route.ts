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
import { dispositifProgrammeNationalLabels } from '@app/web/features/structures/dispositifProgrammesNationaux'
import { formationLabelLabels } from '@app/web/features/structures/formationLabel'
import { fraisAChargeLabels } from '@app/web/features/structures/fraisACharge'
import { itineranceLabels } from '@app/web/features/structures/itinerance'
import { modaliteAccompagnementLabels } from '@app/web/features/structures/modaliteAccompagnement'
import { modaliteAccesLabels } from '@app/web/features/structures/modalitesAcces'
import { priseEnChargeSpecifiqueLabels } from '@app/web/features/structures/priseEnChargeSpecifique'
import { publicSpecifiquementAdresseLabels } from '@app/web/features/structures/publicSpecifiquementAdresse'
import { serviceLabels } from '@app/web/features/structures/service'
import { prismaClient } from '@app/web/prismaClient'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import {
  DispositifProgrammeNational,
  FormationLabel,
  FraisACharge,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
} from '@prisma/client'
import { NextResponse } from 'next/server'
import { z, type ZodError } from 'zod'

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
 *             - structure_parente
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
 *             structure_parente:
 *               type: string
 *               nullable: true
 *               example: "association nationale"
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
 *             Liste d'identifiants de structures (uuid) séparés par des virgules. Exemple : ids=uuid1,uuid2. Maximum 100 ids.
 *         required: false
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

type StructureAttributes = {
  structure_cartographie_nationale_id: string | null
  creation: string
  modification: string
  suppression: string | null
  nom: string
  adresse: string
  commune: string
  code_postal: string
  code_insee: string | null
  complement_adresse: string | null
  latitude: number | null
  longitude: number | null
  siret: string | null
  rna: string | null
  visible_pour_cartographie_nationale: boolean
  typologies: string[]
  presentation_resume: string | null
  presentation_detail: string | null
  site_web: string | null
  telephone: string | null
  courriels: string[]
  fiche_acces_libre: string | null
  horaires: string | null
  prise_rdv: string | null
  structure_parente: string | null
  services: string[]
  publics_specifiquement_adresses: string[]
  prise_en_charge_specifique: string[]
  frais_a_charge: string[]
  dispositif_programmes_nationaux: string[]
  formations_labels: string[]
  autres_formations_labels: string[]
  itinerance: string[]
  modalites_acces: string[]
  modalites_accompagnement: string[]
  mediateurs_en_activite: number
  emplois: number
}

type StructureRelationships = never

export type StructureResource = JsonApiResource<
  'structure',
  StructureAttributes,
  StructureRelationships
>

export type StructureListResponse = JsonApiListResponse<StructureResource>

/**
 * for consistent cursor-based pagination, we reuse the approach from cras:
 * we'll combine the "creation" + "id" fields into a single base64-coded composite cursor
 * ensure you have a unique composite index on (creation, id) in your prisma model
 */
const StructureCursorValidation = z.object({
  creation_id: z.object({
    creation: z.coerce.string().datetime(),
    id: z.string().uuid(),
  }),
})

export const GET = createApiV1Route
  .configure<StructureListResponse>({
    scopes: ['Structures'],
  })
  .queryParams(
    JsonApiCursorPaginationQueryParamsValidation.extend({
      /**
       * Liste d'identifiants de structures, séparés par des virgules (CSV).
       * Exemple : ids=uuid1,uuid2
       * Maximum 100 ids.
       */
      ids: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .transform((v) => (Array.isArray(v) ? v : v ? v.split(',') : []))
        .transform((arr) => arr.map((s) => s.trim()).filter(Boolean))
        .transform((arr) => Array.from(new Set(arr)))
        .pipe(z.array(z.string().uuid()).max(100))
        .default([]),
    }),
  )
  .handle(async ({ params }) => {
    const cursorPagination = prismaCursorPagination(params)
    const ids = params.ids as string[]

    const parsedCursor = cursorPagination.cursor
      ? parseCompositeCursor(cursorPagination.cursor)
      : undefined

    const validatedCursor = parsedCursor
      ? StructureCursorValidation.safeParse({
          creation_id: {
            creation: parsedCursor[0],
            id: parsedCursor[1],
          },
        })
      : undefined

    if (!!validatedCursor && !validatedCursor.success) {
      throw validatedCursor.error as ZodError
    }

    // include all structures, even if suppression != null
    const where = {
      ...(ids.length > 0 ? { id: { in: ids } } : {}),
    }

    const structures = await prismaClient.structure.findMany({
      orderBy: [{ creation: 'desc' }],
      take: cursorPagination.take,
      skip: cursorPagination.skip,
      where,
      include: {
        _count: {
          select: {
            mediateursEnActivite: {
              where: {
                suppression: null,
              },
            },
            emplois: {
              where: {
                suppression: null,
              },
            },
          },
        },
      },
      cursor: validatedCursor
        ? {
            creation_id: {
              creation: validatedCursor.data.creation_id.creation,
              id: validatedCursor.data.creation_id.id,
            },
          }
        : undefined,
    })

    const totalCount = await prismaClient.structure.count({ where })

    const lastItem = structures.at(-1)
    const firstItem = structures.at(0)

    // next page exists only if we filled the page size
    const nextCursor =
      structures.length === cursorPagination.take && lastItem
        ? createCompositeCursor(lastItem.creation.toISOString(), lastItem.id)
        : undefined
    const previousCursor =
      !!parsedCursor && firstItem
        ? createCompositeCursor(firstItem.creation.toISOString(), firstItem.id)
        : undefined

    const queryIdsSuffix = ids.length > 0 ? `&ids=${ids.join(',')}` : ''

    const response: StructureListResponse = {
      data: structures.map((s) => ({
        type: 'structure',
        id: s.id,
        attributes: {
          structure_cartographie_nationale_id:
            s.structureCartographieNationaleId,
          creation: s.creation.toISOString(),
          modification: s.modification.toISOString(),
          suppression: s.suppression ? s.suppression.toISOString() : null,
          nom: s.nom,
          adresse: s.adresse,
          commune: s.commune,
          code_postal: s.codePostal,
          code_insee: s.codeInsee,
          complement_adresse: s.complementAdresse,
          latitude: s.latitude,
          longitude: s.longitude,
          siret: s.siret,
          rna: s.rna,
          visible_pour_cartographie_nationale:
            s.visiblePourCartographieNationale,
          typologies: s.typologies,
          presentation_resume: s.presentationResume,
          presentation_detail: s.presentationDetail,
          site_web: s.siteWeb,
          telephone: s.telephone,
          courriels: s.courriels,
          fiche_acces_libre: s.ficheAccesLibre,
          horaires: s.horaires,
          prise_rdv: s.priseRdv,
          structure_parente: s.structureParente,
          services: s.services.map(
            (service: Service) => serviceLabels[service],
          ),
          publics_specifiquement_adresses: s.publicsSpecifiquementAdresses.map(
            (publicSpecifiquementAdresse: PublicSpecifiquementAdresse) =>
              publicSpecifiquementAdresseLabels[publicSpecifiquementAdresse],
          ),
          prise_en_charge_specifique: s.priseEnChargeSpecifique.map(
            (priseEnChargeSpecifique: PriseEnChargeSpecifique) =>
              priseEnChargeSpecifiqueLabels[priseEnChargeSpecifique],
          ),
          frais_a_charge: s.fraisACharge.map(
            (fraisACharge: FraisACharge) => fraisAChargeLabels[fraisACharge],
          ),
          dispositif_programmes_nationaux: s.dispositifProgrammesNationaux.map(
            (dispositifProgrammeNational: DispositifProgrammeNational) =>
              dispositifProgrammeNationalLabels[dispositifProgrammeNational],
          ),
          formations_labels: s.formationsLabels.map(
            (formationLabel: FormationLabel) =>
              formationLabelLabels[formationLabel],
          ),
          autres_formations_labels: s.autresFormationsLabels,
          itinerance: s.itinerance.map(
            (itinerance: Itinerance) => itineranceLabels[itinerance],
          ),
          modalites_acces: s.modalitesAcces.map(
            (modaliteAcces: ModaliteAcces) =>
              modaliteAccesLabels[modaliteAcces],
          ),
          modalites_accompagnement: s.modalitesAccompagnement.map(
            (modaliteAccompagnement: ModaliteAccompagnement) =>
              modaliteAccompagnementLabels[modaliteAccompagnement],
          ),
          mediateurs_en_activite: s._count.mediateursEnActivite,
          emplois: s._count.emplois,
        },
      })),
      links: {
        self: {
          href: cursorPagination.cursor
            ? cursorPagination.isBefore
              ? apiV1Url(
                  `/structures?page[before]=${encodeSerializableState(
                    cursorPagination.cursor,
                  )}${queryIdsSuffix}`,
                )
              : apiV1Url(
                  `/structures?page[after]=${encodeSerializableState(
                    cursorPagination.cursor,
                  )}${queryIdsSuffix}`,
                )
            : apiV1Url(
                `/structures${queryIdsSuffix ? `?${queryIdsSuffix.slice(1)}` : ''}`,
              ),
        },
        next: nextCursor
          ? {
              href: apiV1Url(
                `/structures?page[after]=${encodeSerializableState(nextCursor)}${queryIdsSuffix}`,
              ),
            }
          : undefined,
        prev: previousCursor
          ? {
              href: apiV1Url(
                `/structures?page[before]=${encodeSerializableState(
                  previousCursor,
                )}${queryIdsSuffix}`,
              ),
            }
          : undefined,
      },
      meta: {
        total_count: totalCount,
        items_per_page: cursorPagination.take,
        total_pages: Math.ceil(totalCount / cursorPagination.take),
        has_next_page: !!nextCursor,
        has_prev_page: !!previousCursor,
      },
    }

    return NextResponse.json(response)
  })
