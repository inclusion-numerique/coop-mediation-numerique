import { createApiV1Route } from '@app/web/app/api/v1/createApiV1Route'
import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { prismaClient } from '@app/web/prismaClient'
import {
  DispositifProgrammeNational,
  LieuMediationNumerique,
  SchemaLieuMediationNumerique,
  toSchemaLieuMediationNumerique,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Aidant = {
  id: string
  nom: string
  courriel: string
  telephone?: string
}

/**
 * @openapi
 * components:
 *   schemas:
 *     LieuInclusionNumerique:
 *       required:
 *         - id
 *         - nom
 *         - commune
 *         - code_postal
 *         - adresse
 *         - date_maj
 *         - services
 *         - pivot
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique local. Le producteur de donnée le génère librement selon sa méthode. Il peut par exemple s’agir d’une suite de lettres et/ou de chiffres, ou d’un [UUID (universal unique identifier) produit aléatoirement](https://www.uuidgenerator.net/)
 *           example: 105c8bcd-e977-4180-a895-96b6a6c688c0
 *         pivot:
 *           type: string
 *           description: Donnée pivot provenant d’une des deux bases de référence - le répertoire SIRENE des entreprises et de leurs établissements de l’Insee ou le Répertoire national des associations du ministère de l’intérieur (RNA).
 *           example: "55217862900132"
 *         nom:
 *           type: string
 *           description: Nom du lieu d'inclusion numérique.
 *           example: Anonymal
 *         commune:
 *           type: string
 *           description: Nom de la commune rattachée à l’adresse du lieu.
 *           example: Reims
 *         code_postal:
 *           type: string
 *           description: Code postal rattaché à l’adresse du lieu.
 *           example: "51100"
 *         code_insee:
 *           type: string
 *           description: Code officiel géographique de la commune rattachée à l’adresse du lieu.
 *           example: "51454"
 *         adresse:
 *           type: string
 *           description: Éléments de l’adresse du lieu relatifs à la voie. Typiquement, <numero_voie> <indice_de_repetition> <type_voie> <libelle_voie>.
 *           example: 12 BIS RUE DE LECLERCQ
 *         complement_adresse:
 *           type: string
 *           description: Précision de l’adresse et la situation exacte du lieu, afin d’en permettre l’accès aux usagers. Cela peut être un numéro d’appartement, un étage, un lieu-dit, etc.
 *           example: Le patio du bois de l’Aulne
 *         latitude:
 *           type: number
 *           description: Latitude du lieu, dans le système WGS84 (GPS), typiquement issue du géocodage de son adresse et pouvant servir à la localiser.
 *           example: 43.52609
 *         longitude:
 *           type: number
 *           description: Longitude du lieu, dans le système WGS84 (GPS), typiquement issue du géocodage de son adresse et pouvant servir à la localiser.
 *           example: 5.41423
 *         typologie:
 *           type: string
 *           description: Type du lieu, les valeurs possibles (il est possible d’en renseigner plusieurs) sont restreintes au [vocabulaire décrivant les types de structures défini par data.inclusion](https://www.data.inclusion.beta.gouv.fr/schemas-de-donnees-de-loffre/schema-des-structures-dinsertion/typologies-de-structure).
 *           example: CCAS|RFS
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone du lieu.
 *           example: "+33180059880"
 *         courriels:
 *           type: string
 *           format: Un ou plusieurs email séparés par `|`
 *           description: Adresse email générique de contact du lieu.
 *           example: contact@laquincaillerie.tl|responsable@laquincaillerie.tl
 *         site_web:
 *           type: string
 *           format: Un ou plusieurs URL séparés par `|`
 *           description: Une ou plusieurs URL vers le site internet du lieu et/ou les réseaux sociaux.
 *           example: https://www.laquincaillerie.tl/;https://m.facebook.com/laquincaillerienumerique/
 *         horaires:
 *           type: string
 *           description: Les jours et horaires d’ouverture du lieu, en respectant le format proposé par [OpenStreetMap](https://wiki.openstreetmap.org/wiki/FR:Key:opening_hours).
 *           example: Mo-Fr 09:00-12:00,14:00-18:30; Sa 08:30-12:00
 *         presentation_resume:
 *           type: string
 *           description: Courte description du lieu (500 caractères maximum).
 *           example: Notre association propose des formations aux outils numériques à destination des personnes âgées.
 *         presentation_detail:
 *           type: string
 *           description: Description plus détaillée du lieu. Il est par exemple possible de préciser si des aidants sont itinérants.
 *           example: Notre parcours d’initiation permet l’acquisition de compétences numériques de base. Nous proposons également un accompagnement à destination des personnes déjà initiées qui souhaiteraient approfondir leurs connaissances. Du matériel informatique est en libre accès pour nos adhérents tous les après-midis. En plus de d’accueillir les personnes dans notre lieu en semaine (sur rendez-vous), nous assurons une permanence le samedi matin dans la médiathèque XX.
 *         source:
 *           type: string
 *           description: Indique la structure qui a collecté les données sur le lieu. Cela peut être la structure elle-même ou une structure tierce (une collectivité territoriale, un réseau de médiation numérique…)
 *           example: Les Assembleurs
 *         itinerance:
 *           type: string
 *           format: Une ou plusieurs de ces valeurs séparées par `|`
 *           enum: [Itinérant, Fixe]
 *           description: "Indique s'il s'agit un lieu de médiation itinérant comme un bus numérique"
 *           example: Itinérant
 *         structure_parente:
 *           type: string
 *           description: Décrit le réseau/la structure auquel le lieu appartient. Pour le remplir\, indiquer le nom de cette entité.
 *           example: SIRET de la ville pour une bibliothèque
 *         date_maj:
 *           type: string
 *           format: date
 *           description: Date à laquelle la donnée considérée a été mise à jour. Il respecte le format ISO 8601 (année-mois-jour).
 *           example: 2022-06-02
 *         services:
 *           type: string
 *           format: Une ou plusieurs de ces valeurs séparées par `|` [Aide aux démarches administratives, Maîtrise des outils numériques du quotidien, Insertion professionnelle via le numérique, Utilisation sécurisée du numérique, Parentalité et éducation avec le numérique, Loisirs et créations numériques, Compréhension du monde numérique, Accès internet et matériel informatique, Acquisition de matériel informatique à prix solidaire]
 *           description: Types d’accompagnement proposés dans l’offre du lieu.
 *           example: Maîtrise des outils numériques du quotidien|Insertion professionnelle via le numérique|Loisirs et créations numériques
 *         publics_specifiquement_adresses:
 *           type: string
 *           format: Une ou plusieurs de ces valeurs séparées par `|` [Jeunes, Étudiants, Familles et/ou enfants, Seniors, Femmes]
 *           description: Indique si l’action du lieu est tournée vers un public spécifiquement adressé.
 *           example: Jeunes|Femmes
 *         prise_en_charge_specifique:
 *           type: string
 *           format: Une ou plusieurs de ces valeurs séparées par `|` [Surdité, Handicaps moteurs, Handicaps mentaux, Illettrisme, Langues étrangères (anglais), Langues étrangères (autres), Déficience visuelle]
 *           description: Indique si le lieu est en mesure d’accompagner et soutenir des publics ayant des besoins particuliers.
 *           example: Surdité|Illettrisme|Langues étrangères (anglais)
 *         frais_a_charge:
 *           type: string
 *           format: Une ou plusieurs de ces valeurs séparées par `|` [Gratuit, Gratuit sous condition, Payant]
 *           description: Conditions financières d’accès au lieu.
 *           example: Gratuit sous condition|Payant
 *         dispositif_programmes_nationaux:
 *           type: string
 *           format: Une ou plusieurs de ces valeurs séparées par `|` [Aidants Connect, Bibliothèques numérique de référence, Certification PIX, Conseillers numériques, Emmaüs Connect, France Services, Grande école du numérique, La Croix Rouge, Point d'accès numérique CAF, Promeneurs du net, Relais numérique (Emmaüs Connect)]
 *           description: Indique si le lieu appartient à un dispositif ou à un programme national.
 *           example: Aidants Connect|Conseillers numériques|La Croix Rouge
 *         formations_labels:
 *           type: string
 *           format: Une ou plusieurs de ces valeurs séparées par `|` [Formé à « Mon Espace Santé », Formé à « DUPLEX » (illettrisme), Arnia/MedNum BFC (Bourgogne-Franche-Comté), Collectif ressources et acteurs réemploi (Normandie), Fabriques de Territoire, Les Éclaireurs du numérique (Drôme), Mes Papiers (Métropole de Lyon), ORDI 3.0, SUD LABS (PACA)]
 *           description: Indique si le lieu a obtenu un ou plusieurs formations et labels.
 *           example: Formé à « Mon Espace Santé »|Arnia/MedNum BFC (Bourgogne-Franche-Comté)
 *         autres_formations_labels:
 *           type: string
 *           format: Une ou plusieurs valeurs séparées par `|`
 *           description: Les labels ou formations du lieu non proposés dans le champ ‘Formations et labels’.
 *           example: Label et la bête
 *         modalites_acces:
 *           type: string
 *           format: Une ou plusieurs de ces valeurs séparées par `|` [Se présenter, Téléphoner, Contacter par mail, Prendre un RDV en ligne, Ce lieu n’accueille pas de public, Envoyer un mail avec une fiche de prescription]
 *           description: Étapes ou démarches à suivre pour se rendre au lieu d’inclusion numérique et bénéficier de ses services.
 *           example: Se présenter|Téléphoner
 *         modalites_accompagnement:
 *           type: string
 *           format: Une ou plusieurs de ces valeurs séparées par `|` [En autonomie, Accompagnement individuel, Dans un atelier collectif, À distance]
 *           description: Types d’accompagnement proposés par le lieu.
 *           example: Dans un atelier collectif|À distance|En autonomie|Accompagnement individuel
 *         fiche_acces_libre:
 *           type: string
 *           format: URL
 *           description: URL renvoyant vers le profil [Acceslibre](https://acceslibre.beta.gouv.fr/) du lieu.
 *           example: https://acceslibre.beta.gouv.fr/app/29-lampaul-plouarzel/a/bibliotheque-mediatheque/erp/mediatheque-13/
 *         prise_rdv:
 *           type: string
 *           format: URL
 *           description: URL renvoyant vers le site de prise de rendez-vous en ligne avec les aidants du lieu.
 *           example: https://rdv.anct.gouv.fr/
 * /lieux-activite:
 *   get:
 *     summary: liste des lieux d'activité
 *     description: Retourne la liste des structures dans lesquels il y a une activité de médiation numérique au format définit par le schéma des lieux de médiation numérique.
 *     tags:
 *       - Structures
 *       - Lieux d'activité
 *     parameters:
 *       - in: query
 *         name: filter[dispositif_programmes_nationaux]
 *         required: false
 *         description: Filtre les lieux qui appartient au dispositif ou au programme national correspondant
 *         schema:
 *           type: string
 *           enum: [Aidants Connect, Bibliothèques numérique de référence, Certification PIX, Conseillers numériques, Emmaüs Connect, France Services, Grande école du numérique, La Croix Rouge, Point d'accès numérique CAF, Promeneurs du net, Relais numérique (Emmaüs Connect)]
 *           example: 'Conseillers numériques'
 *       - in: query
 *         name: ids
 *         schema:
 *           type: string
 *           description: |
 *             Liste d'identifiants de structures (uuid) séparés par des virgules. Exemple : ids=uuid1,uuid2. Maximum 100 ids.
 *         required: false
 *     responses:
 *       200:
 *         description: La liste des lieux d'inclusion numérique.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LieuInclusionNumerique'
 */
export const GET = createApiV1Route
  .configure<(SchemaLieuMediationNumerique & { aidants?: Aidant[] })[]>({
    scopes: ['LieuxActivite'],
  })
  .queryParams(
    z.object({
      /**
       * Liste d'identifiants de structures (uuid) séparés par des virgules.
       * Exemple: ids=uuid1,uuid2
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
      filter: z
        .object({
          dispositif_programmes_nationaux: z
            .enum(
              Object.values(DispositifProgrammeNational) as [
                string,
                ...string[],
              ],
            )
            .optional(),
        })
        .default({}),
    }),
  )
  .handle(async ({ params }) => {
    const { dispositif_programmes_nationaux } = params.filter
    const ids = params.ids as string[]

    const lieuxDeMediationNumerique = await prismaClient.$queryRaw<
      (LieuMediationNumerique & { aidants?: Aidant[] })[]
    >`
    WITH base AS (
      SELECT structures.id,
        COALESCE(NULLIF(structures.siret, ''), NULLIF(structures.rna, ''), '00000000000000') AS pivot,
        structures.nom,
        jsonb_strip_nulls(
          jsonb_build_object(
            'voie', structures.adresse,
            'complement_adresse', NULLIF(structures.complement_adresse, ''),
            'code_postal', structures.code_postal,
            'code_insee', structures.code_insee,
            'commune', structures.commune
          )
        ) AS adresse,
        jsonb_strip_nulls(
          jsonb_build_object(
            'latitude', structures.latitude,
            'longitude', structures.longitude
          )
        ) AS localisation,
        NULLIF(structures.typologies, '{}') AS typologies,
        jsonb_strip_nulls(
          jsonb_build_object(
            'telephone', NULLIF(structures.telephone, ''),
            'courriels', NULLIF(structures.courriels, '{}'),
            'site_web', CASE WHEN NULLIF(structures.site_web, '') IS NOT NULL THEN ARRAY[structures.site_web] END
          )
        ) AS contact,
        NULLIF(structures.horaires, '') AS horaires,
        jsonb_strip_nulls(
          jsonb_build_object(
            'resume', NULLIF(structures.presentation_resume, ''),
            'detail', NULLIF(structures.presentation_detail, '')
          )
        ) AS presentation,
        'Coop numérique' AS source,
        structures.itinerance,
        NULLIF(structures.itinerance, '{}') AS itinerance, structures.modification as "date_maj",
        NULLIF(structures.services, '{}') AS services,
        NULLIF(structures.structure_parente, '{}') AS structure_parente,
        NULLIF(structures.publics_specifiquement_adresses, '{}') AS publics_specifiquement_adresses,
        NULLIF(structures.prise_en_charge_specifique, '{}') AS prise_en_charge_specifique,
        NULLIF(structures.frais_a_charge, '{}') AS frais_a_charge,
          CASE
            WHEN COUNT(conseillers_numeriques.id) > 0 THEN ARRAY['Conseillers numériques']
          END
        AS dispositif_programmes_nationaux,
        NULLIF(structures.formations_labels, '{}') AS formations_labels,
        NULLIF(structures.autres_formations_labels, '{}') AS autres_formations_labels,
        NULLIF(structures.modalites_acces, '{}') AS modalites_acces,
        NULLIF(structures.modalites_accompagnement, '{}') AS modalites_accompagnement,
        NULLIF(structures.fiche_acces_libre, '') AS fiche_acces_libre,
        NULLIF(structures.prise_rdv, '') AS prise_rdv,
        COALESCE(
            jsonb_agg(
              jsonb_strip_nulls(jsonb_build_object(
                'nom', users.name,
                'courriel', users.email,
                'telephone', NULLIF(users.phone, ''),
                'id', conseillers_numeriques.id
              ))
            ) FILTER (WHERE users.id IS NOT NULL),
            '[]'::jsonb
          ) AS aidants
        FROM structures structures
          LEFT JOIN mediateurs_en_activite mediateurs_en_activite  ON structures.id = mediateurs_en_activite.structure_id
          LEFT JOIN conseillers_numeriques conseillers_numeriques ON mediateurs_en_activite.mediateur_id = conseillers_numeriques.mediateur_id
          LEFT JOIN mediateurs ON mediateurs_en_activite.mediateur_id = mediateurs.id AND mediateurs.is_visible = TRUE
          LEFT JOIN users ON mediateurs.user_id = users.id
      WHERE structures.suppression IS NULL
        AND mediateurs_en_activite.suppression IS NULL AND mediateurs_en_activite.fin_activite IS NULL
        AND structures.visible_pour_cartographie_nationale IS true
      GROUP BY structures.id
    )
    SELECT *
    FROM base
        ${
          ids.length > 0 || dispositif_programmes_nationaux
            ? Prisma.sql`WHERE ${
                ids.length > 0
                  ? Prisma.sql`id IN (${Prisma.join(ids.map((id) => Prisma.sql`${id}::uuid`))})`
                  : Prisma.empty
              } ${
                ids.length > 0 && dispositif_programmes_nationaux
                  ? Prisma.sql`AND`
                  : Prisma.empty
              } ${
                dispositif_programmes_nationaux
                  ? Prisma.sql`${dispositif_programmes_nationaux}::text = ANY(dispositif_programmes_nationaux)`
                  : Prisma.empty
              }`
            : Prisma.empty
        }
    `

    const conseillerCollection =
      await conseillerNumeriqueMongoCollection('conseillers')

    const conseillersIds = new Set(
      (await conseillerCollection.find().toArray())
        .filter(({ statut }) => statut === 'RECRUTE')
        .map((conseiller) => conseiller._id.toString()),
    )

    const result = lieuxDeMediationNumerique.map((lieu) => {
      const aidants =
        lieu.aidants?.filter((aidant) => conseillersIds.has(aidant.id)) ?? []

      return {
        ...toSchemaLieuMediationNumerique(lieu),
        ...(aidants && aidants.length > 0 ? { aidants } : {}),
      }
    })

    return NextResponse.json(result)
  })
