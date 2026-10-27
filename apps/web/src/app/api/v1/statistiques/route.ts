import { apiV1Url } from '@app/web/app/api/v1/apiV1Url'
import type {
  JsonApiItemResponse,
  JsonApiResource,
} from '@app/web/app/api/v1/JsonApiTypes'
import {
  withApiV1Errors,
  withClientApi,
  withQueryParams,
} from '@app/web/app/api/v1/middlewares'
import { serializeApiRequestParams } from '@app/web/app/api/v1/serializeApiRequestParams'
import {
  FiltresDesStatistiquesValidation,
  type StatistiquesAttributes,
  statistiquesAttributes,
  statistiquesExposees,
} from '@app/web/features/statistiques/abilities/exposer-les-statistiques'
import { routeBuilder } from '@arckit/nextjs/route'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     LabelCount:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *           example: "31/12"
 *         count:
 *           type: integer
 *           example: 497
 *
 *     ValueLabelCountProportion:
 *       type: object
 *       properties:
 *         value:
 *           type: string
 *           example: "Masculin"
 *         label:
 *           type: string
 *           example: "Masculin"
 *         count:
 *           type: integer
 *           example: 76493
 *         proportion:
 *           type: number
 *           format: float
 *           example: 26.576
 *
 *     Beneficiaires:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 287830
 *         genres:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValueLabelCountProportion'
 *         tranche_ages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValueLabelCountProportion'
 *         statuts_social:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValueLabelCountProportion'
 *
 *     Activites:
 *       type: object
 *       description: Répartition des accompagnements, un atelier collectif de 10 participants compte pour 10
 *       properties:
 *         total:
 *           type: integer
 *           description: Nombre d’accompagnements, égal à totaux.accompagnements.total
 *           example: 324949
 *         type_activites:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValueLabelCountProportion'
 *         durees:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValueLabelCountProportion'
 *         type_lieu:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValueLabelCountProportion'
 *         thematiques:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValueLabelCountProportion'
 *         materiels:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValueLabelCountProportion'
 *
 *     TotauxActivites:
 *       type: object
 *       description: Comptage des activités, un atelier collectif compte pour 1 quel que soit son nombre de participants
 *       properties:
 *         total:
 *           type: integer
 *           description: Nombre d’activités enregistrées
 *           example: 174140
 *         individuels:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 95189
 *             proportion:
 *               type: number
 *               format: float
 *               example: 54.662
 *         collectifs:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 27404
 *             proportion:
 *               type: number
 *               format: float
 *               example: 15.737
 *             participants:
 *               type: integer
 *               example: 178210
 *         demarches:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 51547
 *             proportion:
 *               type: number
 *               format: float
 *               example: 29.601
 *
 *     TotauxAccompagnements:
 *       type: object
 *       description: Comptage des accompagnements, un atelier collectif de 10 participants compte pour 10
 *       properties:
 *         total:
 *           type: integer
 *           example: 324949
 *         individuels:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 95189
 *             proportion:
 *               type: number
 *               format: float
 *               example: 29.294
 *         collectifs:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Nombre de participants aux ateliers collectifs
 *               example: 178210
 *             proportion:
 *               type: number
 *               format: float
 *               example: 54.843
 *         demarches:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 51547
 *             proportion:
 *               type: number
 *               format: float
 *               example: 15.863
 *
 *     TotauxBeneficiaires:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 287830
 *         nouveaux:
 *           type: integer
 *           example: 0
 *         suivis:
 *           type: integer
 *           example: 23405
 *         anonymes:
 *           type: integer
 *           example: 264425
 *
 *     Totaux:
 *       type: object
 *       properties:
 *         activites:
 *           $ref: '#/components/schemas/TotauxActivites'
 *         accompagnements:
 *           $ref: '#/components/schemas/TotauxAccompagnements'
 *         beneficiaires:
 *           $ref: '#/components/schemas/TotauxBeneficiaires'
 *
 *     StatistiquesAttributes:
 *       type: object
 *       properties:
 *         accompagnements_par_jour:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LabelCount'
 *         accompagnements_par_mois:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LabelCount'
 *         beneficiaires:
 *           $ref: '#/components/schemas/Beneficiaires'
 *         activites:
 *           $ref: '#/components/schemas/Activites'
 *         totaux:
 *           $ref: '#/components/schemas/Totaux'
 *
 *     Statistiques:
 *       type: object
 *       required: [type, id, attributes]
 *       properties:
 *         type:
 *           type: string
 *           example: "statistiques"
 *           enum: [statistiques]
 *         id:
 *           type: string
 *           example: "statistiques"
 *         attributes:
 *           $ref: '#/components/schemas/StatistiquesAttributes'
 *
 * /statistiques:
 *   get:
 *     summary: obtenir des statistiques globales
 *     description: >
 *       retourne les données agrégées (accompagnements par jour, par mois, répartition des bénéficiaires, etc.)
 *     tags:
 *       - Statistiques
 *     parameters:
 *       - in: query
 *         name: filter[du]
 *         required: false
 *         description: Date de l’activité minimum, au format ISO (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
 *           example: '2022-01-01'
 *
 *       - in: query
 *         name: filter[au]
 *         required: false
 *         description: Date de l’activité maximum, au format ISO (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
 *           example: '2022-01-31'
 *
 *       - in: query
 *         name: filter[types]
 *         required: false
 *         description: Types d’activités (individuel et/ou collectif) séparés par des virgules
 *         schema:
 *           type: string
 *           enum: [Individuel, Collectif]
 *           example: 'Individuel'
 *
 *       - in: query
 *         name: filter[mediateurs]
 *         required: false
 *         description: UUID des médiateurs ayant réalisé les activités séparés par des virgules
 *         schema:
 *           type: string
 *           format: uuid
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *
 *       - in: query
 *         name: filter[beneficiaires]
 *         required: false
 *         description: UUID des bénéficiaire des activités séparés par des virgules
 *         schema:
 *           type: string
 *           format: uuid
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *
 *       - in: query
 *         name: filter[communes]
 *         required: false
 *         description: Code INSEE des communes où les activités ont étés réalisées (5 caractères) séparés par des virgules
 *         schema:
 *           type: string
 *           minLength: 5
 *           maxLength: 5
 *           example: '69385'
 *
 *       - in: query
 *         name: filter[departements]
 *         required: false
 *         description: Code des départements où les activités ont étés réalisées (1 à 3 caractères) séparés par des virgules
 *         schema:
 *           type: string
 *           maxLength: 3
 *           example: '69'
 *
 *       - in: query
 *         name: filter[lieux]
 *         required: false
 *         description: UUID des lieux où les activités ont étés réalisées séparés par des virgules
 *         schema:
 *           type: string
 *           format: uuid
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *
 *       - in: query
 *         name: filter[conseiller_numerique]
 *         schema:
 *           type: string
 *           enum: ['0', '1']
 *         required: false
 *         description: Indique si l'activité a été effectuée par un médiateur dans le cadre du dispositif "conseiller numérique". '0' signifie hors dispositif, '1' signifie dans le dispositif.
 *
 *       - in: query
 *         name: filter[demarches_administratives]
 *         schema:
 *           type: string
 *           enum: ['0', '1']
 *         required: false
 *         description: Indique si l'activité concerne une aide aux démarches administratives. '0' signifie que la thématique n'est pas présente, '1' signifie qu'elle est présente.
 *
 *     responses:
 *       200:
 *         description: données statistiques
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [data, links, meta]
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Statistiques'
 *                 links:
 *                   type: object
 *                   properties:
 *                     self:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                           format: uri
 *                           example: "http://localhost:3000/api/v1/statistiques"
 *                 meta:
 *                   type: object
 *                   example: {}
 */

export type StatistiqueResource = JsonApiResource<
  'statistiques',
  StatistiquesAttributes,
  never
>

export type StatistiquesResponse = JsonApiItemResponse<StatistiqueResource>

const StatistiquesQueryParamsValidation = z.object({
  filter: FiltresDesStatistiquesValidation,
})

export const GET = routeBuilder()
  .use(withClientApi(['Statistiques']))
  .use(withQueryParams(StatistiquesQueryParamsValidation))
  .handle(
    withApiV1Errors(async ({ queryParams }) => {
      const requete = serializeApiRequestParams(queryParams)

      return NextResponse.json({
        data: {
          type: 'statistiques',
          id: 'statistiques',
          attributes: statistiquesAttributes(
            await statistiquesExposees(queryParams.filter),
          ),
        },
        links: {
          self: {
            href: apiV1Url(
              requete.length > 0 ? `/statistiques?${requete}` : '/statistiques',
            ),
          },
        },
        meta: {},
      } satisfies StatistiquesResponse)
    }),
  )
