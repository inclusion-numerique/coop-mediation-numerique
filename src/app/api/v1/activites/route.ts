import { routeBuilder } from '@arckit/nextjs/route'
import { NextResponse } from 'next/server'
import { activiteExposee } from '@/features/activites/abilities/exposer-les-activites/implementations/api/activite-exposee.transfer'
import {
  criteresDExposition,
  curseurDActivite,
} from '@/features/activites/abilities/exposer-les-activites/implementations/api/criteres-d-exposition.transfer'
import { activitesExposees } from '@/features/activites/abilities/exposer-les-activites/implementations/prisma/activites-exposees.query'
import {
  withApiV1Errors,
  withClientApi,
  withQueryParams,
} from '@/features/clients-api/abilities/authentifier-un-client-api/implementations/api-v1'
import { ActivitesQueryParamsValidation } from '@/features/clients-api/abilities/lire-les-activites/implementations/api-v1/activites.params'
import { reponseDesActivites } from '@/features/clients-api/abilities/lire-les-activites/implementations/api-v1/activites.response'
import { curseurLu, prismaCursorPagination } from '@/libraries/json-api'

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
 *             - suppression
 *             - autonomie
 *             - oriente_vers_structure
 *             - structure_de_redirection
 *             - materiel
 *             - thematiques
 *             - tags
 *             - precisions_demarche
 *             - titre_atelier
 *             - niveau_atelier
 *             - beneficiaires
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
 *               format: date
 *               description: date à laquelle l'activité s'est déroulée
 *               example: "2024-12-10"
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
 *             suppression:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: date de suppression (si l’activité est supprimée)
 *               example: "2025-01-05T10:00:00Z"
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
 *             tags:
 *               type: array
 *               description: tags associés à l'activité
 *               items:
 *                 type: string
 *                 example: "atelier de codage"
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
 *             beneficiaires:
 *               type: object
 *               description: données agrégées sur les bénéficiaires de l'activité
 *               required:
 *                 - total
 *                 - genres
 *                 - tranches_age
 *                 - statuts
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: nombre total de bénéficiaires
 *                   example: 3
 *                 genres:
 *                   type: object
 *                   description: répartition par genre
 *                   properties:
 *                     masculin:
 *                       type: integer
 *                       example: 1
 *                     feminin:
 *                       type: integer
 *                       example: 2
 *                     non_communique:
 *                       type: integer
 *                       example: 0
 *                 tranches_age:
 *                   type: object
 *                   description: répartition par tranche d'âge
 *                   properties:
 *                     moins_de_douze:
 *                       type: integer
 *                       example: 0
 *                     douze_dix_huit:
 *                       type: integer
 *                       example: 1
 *                     dix_huit_vingt_quatre:
 *                       type: integer
 *                       example: 1
 *                     vingt_cinq_trente_neuf:
 *                       type: integer
 *                       example: 0
 *                     quarante_cinquante_neuf:
 *                       type: integer
 *                       example: 1
 *                     soixante_soixante_neuf:
 *                       type: integer
 *                       example: 0
 *                     soixante_dix_plus:
 *                       type: integer
 *                       example: 0
 *                     non_communique:
 *                       type: integer
 *                       example: 0
 *                 statuts:
 *                   type: object
 *                   description: répartition par statut social
 *                   properties:
 *                     scolarise:
 *                       type: integer
 *                       example: 1
 *                     sans_emploi:
 *                       type: integer
 *                       example: 0
 *                     en_emploi:
 *                       type: integer
 *                       example: 2
 *                     retraite:
 *                       type: integer
 *                       example: 0
 *                     non_communique:
 *                       type: integer
 *                       example: 0
 * /activites:
 *   get:
 *     summary: liste des activités
 *     description: >
 *       retourne la liste des activités renseignées par les médiateurs sur la coop.
 *       les activités sont triées par date de dernière modification décroissante.
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
 *       - in: query
 *         name: filter[creation][depuis]
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T00:00:00Z"
 *         required: false
 *         description: "retourne les activités avec une date de création supérieure ou égale à cette date-heure"
 *       - in: query
 *         name: filter[modification][depuis]
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T00:00:00Z"
 *         required: false
 *         description: "retourne les activités avec une date de dernière modification supérieure ou égale à cette date-heure"
 *     responses:
 *       401:
 *         $ref: '#/components/responses/NonAuthentifie'
 *       403:
 *         $ref: '#/components/responses/NonAutorise'
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

export const GET = routeBuilder()
  .use(withClientApi(['Activites']))
  .use(withQueryParams(ActivitesQueryParamsValidation))
  .handle(
    withApiV1Errors(async ({ queryParams }) => {
      const pagination = prismaCursorPagination(queryParams)
      const curseur = curseurLu(pagination)

      const { activites, total } = await activitesExposees({
        criteres: criteresDExposition(queryParams.filter),
        take: pagination.take,
        curseur: curseur ? curseurDActivite(curseur) : null,
      })

      return NextResponse.json(
        reponseDesActivites({
          activites,
          total,
          pagination,
          curseur,
          filtre: queryParams.filter,
          attributs: activiteExposee,
        }),
      )
    }),
  )
