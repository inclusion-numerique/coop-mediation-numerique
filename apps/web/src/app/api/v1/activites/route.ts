import {
  JsonApiCursorPaginationQueryParamsValidation,
  createCompositeCursor,
  parseCompositeCursor,
  prismaCursorPagination,
} from '@app/web/app/api/v1/CursorPagination'
import type {
  JsonApiListResponse,
  JsonApiResource,
} from '@app/web/app/api/v1/JsonApiTypes'
import { apiV1Url } from '@app/web/app/api/v1/apiV1Url'
import { createApiV1Route } from '@app/web/app/api/v1/createApiV1Route'
import { niveauAtelierApiValues } from '@app/web/features/activites/use-cases/cra/collectif/fields/niveau-atelier'
import { materielApiValues } from '@app/web/features/activites/use-cases/cra/fields/materiel'
import { thematiqueApiValues } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { typeActiviteApiValues } from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { typeLieuApiValues } from '@app/web/features/activites/use-cases/cra/fields/type-lieu'
import { autonomieApiValues } from '@app/web/features/activites/use-cases/cra/individuel/fields/autonomie'
import { structureDeRedirectionApiValues } from '@app/web/features/activites/use-cases/cra/individuel/fields/structures-redirection'
import { prismaClient } from '@app/web/prismaClient'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { NextResponse } from 'next/server'
import { type ZodError, z } from 'zod'

/**
 * API response types MUST be manually defined to NOT be infered
 * so API response are stable even if the database schema or transformations changes
 */

type ActiviteAttributes = {
  type: 'individuel' | 'demarche_administrative' | 'collectif'
  mediateur_id: string
  user_id: string
  accompagnements: number
  date: string
  duree: number // minutes

  type_lieu: 'lieu_activite' | 'domicile' | 'a_distance' | 'autre'
  structure_id: string | null // renseigné si type_lieu = lieu_activite

  // lieu* est renseigné si type_lieu = domicile ou a_distance ou autre
  lieu_code_postal: string | null
  lieu_commune: string | null
  lieu_code_insee: string | null
  creation: string
  modification: string
  autonomie:
    | 'entierement_accompagne'
    | 'partiellement_autonome'
    | 'autonome'
    | null

  oriente_vers_structure: boolean | null
  structure_de_redirection:
    | 'operateur_ou_organisme_en_charge'
    | 'aide_aux_demarches_administratives'
    | 'administration'
    | 'mediation_numerique'
    | 'aide_sociale'
    | 'insertion_professionnelle'
    | 'autre'
    | null

  materiel: ('ordinateur' | 'telephone' | 'tablette' | 'autre' | 'aucun')[]

  thematiques: (
    | 'diagnostic_numerique'
    | 'prendre_en_main_du_materiel'
    | 'maintenance_de_materiel'
    | 'gere_ses_contenus_numeriques'
    | 'navigation_sur_internet'
    | 'email'
    | 'bureautique'
    | 'reseaux_sociaux'
    | 'sante'
    | 'banque_et_achats_en_ligne'
    | 'entrepreneuriat'
    | 'insertion_professionnelle'
    | 'securite_numerique'
    | 'parentalite'
    | 'scolarite_et_numerique'
    | 'creer_avec_le_numerique'
    | 'culture_numerique'
    | 'intelligence_artificielle'
    | 'aide_aux_demarches_administratives'
    | 'papiers_elections_citoyennete'
    | 'famille_scolarite'
    | 'social_sante'
    | 'travail_formation'
    | 'logement'
    | 'transports_mobilite'
    | 'argent_impots'
    | 'justice'
    | 'etrangers_europe'
    | 'loisirs_sports_culture'
    | 'associations'
  )[]

  precisions_demarche: string | null

  titre_atelier: string | null

  niveau_atelier: 'debutant' | 'intermediaire' | 'avance' | null // pour un atelier collectif uniquement
}

type ActiviteRelationships = 'mediateur'

export type ActiviteResource = JsonApiResource<
  'activite',
  ActiviteAttributes,
  ActiviteRelationships
>

export type ActiviteListResponse = JsonApiListResponse<ActiviteResource>

const ActiviteCursorValidation = z.object({
  creation_id: z.object({
    creation: z.coerce.string().datetime(),
    id: z.string().uuid(),
  }),
})

/**
 * @openapi
 * components:
 *   schemas:
 *     Activite:
 *       type: object
 *       required: [type, id, attributes]
 *       properties:
 *         type:
 *           type: string
 *           example: "activite"
 *           enum: [activite]
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         attributes:
 *           type: object
 *           required:
 *             - type
 *             - mediateur_id
 *             - accompagnements
 *             - date
 *             - duree
 *             - type_lieu
 *             - structure_id
 *             - lieu_code_postal
 *             - lieu_commune
 *             - lieu_code_insee
 *             - creation
 *             - modification
 *             - autonomie
 *             - oriente_vers_structure
 *             - structure_de_redirection
 *             - materiel
 *             - thematiques
 *             - precisions_demarche
 *             - titre_atelier
 *             - niveau_atelier
 *           properties:
 *             type:
 *               type: string
 *               description: type d'activité
 *               enum: [individuel, demarche_administrative, collectif]
 *               example: "individuel"
 *             mediateur_id:
 *               type: string
 *               format: uuid
 *               description: identifiant du médiateur
 *               example: "123e4567-e89b-12d3-a456-426614174000"
 *             accompagnements:
 *               type: number
 *               description: nombre d'accompagnements
 *               example: 2
 *             date:
 *               type: string
 *               format: date-time
 *               description: date à laquelle l'activité s'est déroulée
 *               example: "2024-12-10T09:00:00Z"
 *             duree:
 *               type: number
 *               description: durée en minutes
 *               example: 120
 *             type_lieu:
 *               type: string
 *               description: type de lieu où l'activité s'est déroulée
 *               enum: [lieu_activite, domicile, a_distance, autre]
 *               example: "lieu_activite"
 *             structure_id:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: identifiant de la structure (renseigné si type_lieu = lieu_activite)
 *               example: "123e4567-e89b-12d3-a456-426614174001"
 *             lieu_code_postal:
 *               type: string
 *               nullable: true
 *               description: code postal du lieu (renseigné si type_lieu = domicile, a_distance ou autre)
 *               example: "69007"
 *             lieu_commune:
 *               type: string
 *               nullable: true
 *               description: commune du lieu (renseignée si type_lieu = domicile, a_distance ou autre)
 *               example: "Lyon"
 *             lieu_code_insee:
 *               type: string
 *               nullable: true
 *               description: code INSEE de la commune (renseigné si type_lieu = domicile, a_distance ou autre)
 *               example: "69123"
 *             creation:
 *               type: string
 *               format: date-time
 *               description: date de création de l'activité
 *               example: "2024-12-10T12:00:00Z"
 *             modification:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: date de dernière modification de l'activité
 *               example: "2024-12-10T15:00:00Z"
 *             autonomie:
 *               type: string
 *               nullable: true
 *               description: niveau d'autonomie lors de l'activité
 *               enum: [entierement_accompagne, partiellement_autonome, autonome]
 *               example: "autonome"
 *             oriente_vers_structure:
 *               type: boolean
 *               nullable: true
 *               description: indique si l'utilisateur a été orienté vers une structure
 *               example: true
 *             structure_de_redirection:
 *               type: string
 *               nullable: true
 *               description: type de structure vers laquelle l'utilisateur a été redirigé
 *               enum: [operateur_ou_organisme_en_charge, aide_aux_demarches_administratives, administration, mediation_numerique, autre]
 *               example: "administration"
 *             materiel:
 *               type: array
 *               description: matériel utilisé lors de l'accompagnement
 *               items:
 *                 type: string
 *                 enum: [ordinateur, telephone, tablette, autre, aucun]
 *                 example: "ordinateur"
 *             thematiques:
 *               type: array
 *               description: thématiques abordées lors de l'accompagnement
 *               items:
 *                 type: string
 *                 enum: [diagnostic_numerique, prendre_en_main_du_materiel, maintenance_de_materiel, navigation_sur_internet, email, bureautique, reseaux_sociaux, sante, banque_et_achats_en_ligne, entrepreneuriat, insertion_professionnelle, securite_numerique, parentalite, scolarite_et_numerique, creer_avec_le_numerique, culture_numerique, intelligence_artificielle, aide_aux_demarches_administratives, papiers_elections_citoyennete, famille_scolarite, social_sante, travail_formation, logement, transports_mobilite, argent_impots, justice, etrangers_europe, loisirs_sports_culture]
 *                 example: "diagnostic_numerique"
 *             precisions_demarche:
 *               type: string
 *               nullable: true
 *               description: précisions sur la démarche administrative
 *               example: "difficultés à compléter le formulaire"
 *             titre_atelier:
 *               type: string
 *               nullable: true
 *               description: titre de l'atelier (pour un atelier collectif)
 *               example: "découverte de l'email"
 *             niveau_atelier:
 *               type: string
 *               nullable: true
 *               description: niveau de l'atelier collectif
 *               enum: [debutant, intermediaire, avance]
 *               example: "debutant"
 * /activites:
 *   get:
 *     summary: liste des activités
 *     description: >
 *       retourne la liste des activités renseignées par les médiateurs sur la coop.
 *
 *       les activités sont triées par date de création décroissante.
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
 *     responses:
 *       200:
 *         description: liste des activités
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [data, links, meta]
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activite'
 *                 links:
 *                   $ref: '#/components/schemas/PaginationLinks'
 *                 meta:
 *                   $ref: '#/components/schemas/ListMetadata'
 */

export const GET = createApiV1Route
  .configure<ActiviteListResponse>({
    scopes: ['Activites'],
  })
  .queryParams(JsonApiCursorPaginationQueryParamsValidation)
  .handle(async ({ params }) => {
    const cursorPagination = prismaCursorPagination(params)

    /**
     * We use a composite cursor to paginate results for API queries
     * using the creation date and id of the activite to ensure unicity
     */
    const parsedCursor = cursorPagination.cursor
      ? parseCompositeCursor(cursorPagination.cursor)
      : undefined

    // validate that parsedCursor 0 is a valid date and parsedCursor 1 is a valid id
    const validatedCursor = parsedCursor
      ? ActiviteCursorValidation.safeParse({
          creation_id: {
            creation: parsedCursor[0],
            id: parsedCursor[1],
          },
        })
      : undefined

    if (!!validatedCursor && !validatedCursor.success) {
      throw validatedCursor.error as ZodError
    }

    const cras = await prismaClient.activite.findMany({
      where: {
        suppression: null,
      },
      orderBy: [{ creation: 'desc' }],
      include: {
        mediateur: true,
        _count: {
          select: {
            accompagnements: true,
          },
        },
      },
      take: cursorPagination.take,
      skip: cursorPagination.skip,
      cursor: validatedCursor
        ? {
            creation_id: validatedCursor.data.creation_id,
          }
        : undefined,
    })

    const totalCount = await prismaClient.activite.count()

    const lastItem = cras.at(-1)
    const firstItem = cras.at(0)

    const nextCursor = lastItem
      ? createCompositeCursor(lastItem.creation.toISOString(), lastItem.id)
      : undefined
    const previousCursor =
      !!parsedCursor && firstItem
        ? createCompositeCursor(firstItem.creation.toISOString(), firstItem.id)
        : undefined

    const response: ActiviteListResponse = {
      data: cras.map(
        ({
          id,
          type,
          mediateur,
          mediateurId,
          date,
          duree,
          structureId,
          lieuCodePostal,
          lieuCommune,
          lieuCodeInsee,
          creation,
          modification,
          typeLieu,
          autonomie,
          structureDeRedirection,
          materiel,
          thematiques,
          orienteVersStructure,
          precisionsDemarche,
          titreAtelier,
          niveau,
          _count: { accompagnements },
        }) =>
          ({
            type: 'activite',
            id,
            attributes: {
              type: typeActiviteApiValues[type],
              mediateur_id: mediateurId,
              user_id: mediateur.userId,
              date: date.toISOString(),
              duree,
              structure_id: structureId,
              lieu_code_postal: lieuCodePostal,
              lieu_commune: lieuCommune,
              lieu_code_insee: lieuCodeInsee,
              creation: creation.toISOString(),
              modification: modification.toISOString(),
              type_lieu: typeLieuApiValues[typeLieu],
              autonomie: autonomie ? autonomieApiValues[autonomie] : null,
              structure_de_redirection: structureDeRedirection
                ? structureDeRedirectionApiValues[structureDeRedirection]
                : null,
              thematiques: thematiques.map(
                (thematique) => thematiqueApiValues[thematique],
              ),
              materiel: materiel.map(
                (materielItem) => materielApiValues[materielItem],
              ),
              oriente_vers_structure: orienteVersStructure,
              precisions_demarche: precisionsDemarche,
              titre_atelier: titreAtelier,
              niveau_atelier: niveau ? niveauAtelierApiValues[niveau] : null,
              accompagnements,
            },
          }) satisfies ActiviteResource,
      ),
      links: {
        self: {
          href: cursorPagination.cursor
            ? cursorPagination.isBefore
              ? apiV1Url(
                  `/activites?page[before]=${encodeSerializableState(
                    cursorPagination.cursor,
                  )}`,
                )
              : apiV1Url(
                  `/activites?page[after]=${encodeSerializableState(
                    cursorPagination.cursor,
                  )}`,
                )
            : apiV1Url('/activites'),
        },
        next: nextCursor
          ? {
              href: apiV1Url(
                `/activites?page[after]=${encodeSerializableState(nextCursor)}`,
              ),
            }
          : undefined,
        prev: previousCursor
          ? {
              href: apiV1Url(
                `/activites?page[before]=${encodeSerializableState(
                  previousCursor,
                )}`,
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
