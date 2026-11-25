import { routeBuilder } from '@arckit/nextjs/route'
import { NextResponse } from 'next/server'
import {
  withApiV1Errors,
  withClientApi,
  withQueryParams,
} from '@/features/clients-api/abilities/authentifier-un-client-api/implementations/api-v1'
import { authentifierUnClientApi } from '@/features/clients-api/abilities/authentifier-un-client-api/implementations/prisma/authentifier-un-client-api.query'
import {
  criteresDesStructures,
  StructuresQueryParamsValidation,
} from '@/features/clients-api/abilities/lire-les-structures/implementations/api-v1/structures.params'
import { reponseDesStructures } from '@/features/clients-api/abilities/lire-les-structures/implementations/api-v1/structures.response'
import { verifySecret } from '@/features/clients-api/implementations/secret/hash-secret.adapter'
import { lieuInventorie } from '@/features/lieux-activite/abilities/inventorier-les-lieux/implementations/api/lieu-inventorie.transfer'
import { inventaireDesLieux } from '@/features/lieux-activite/abilities/inventorier-les-lieux/implementations/prisma/inventaire-des-lieux.query'
import { curseurLu, prismaCursorPagination } from '@/libraries/json-api'

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
 *       401:
 *         $ref: '#/components/responses/NonAuthentifie'
 *       403:
 *         $ref: '#/components/responses/NonAutorise'
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

export const GET = routeBuilder()
  .use(withClientApi(authentifierUnClientApi(verifySecret))(['Structures']))
  .use(withQueryParams(StructuresQueryParamsValidation))
  .handle(
    withApiV1Errors(async ({ queryParams }) => {
      const pagination = prismaCursorPagination(queryParams)
      const curseur = curseurLu(pagination)

      const { lieux, totalCount } = await inventaireDesLieux(
        criteresDesStructures(queryParams, pagination, curseur),
      )

      return NextResponse.json(
        reponseDesStructures({
          lieux,
          total: totalCount,
          pagination,
          curseur,
          requete: queryParams,
          attributs: lieuInventorie,
        }),
      )
    }),
  )
