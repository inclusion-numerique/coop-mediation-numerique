import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import type { CartoStructure } from '@app/web/features/lieux-activite/use-cases/ajouter/domain'
import { Prisma } from '@app/web/generated/entrepot'

// Reconstruit une CartoStructure (forme attendue par l'import "ajouter un lieu d'activité")
// à partir d'une ligne `main.lieu_inclusion` + `main.adresse` de l'Entrepôt.
// Le SIRET (pivot) n'est PAS repris : la cartographie nationale n'en est pas une source
// fiable, seule l'API entreprise fait foi. Les coordonnées vivent dans `main.adresse.geom`
// (postgis, non sélectionnable par le client typé) : on les lit via ST_Y/ST_X en SQL brut
// pour que la structure coop créée à l'import conserve sa latitude/longitude.

const lieuSelect = {
  structureCartographieNationaleId: true,
  nom: true,
  ficheAccesLibre: true,
  presentationDetail: true,
  presentationResume: true,
  horaires: true,
  priseRdv: true,
  source: true,
  contact: true,
  typologies: true,
  services: true,
  modalitesAcces: true,
  modalitesAccompagnement: true,
  publicsSpecifiquementAdresses: true,
  priseEnChargeSpecifique: true,
  fraisACharge: true,
  itinerance: true,
  adresse: {
    select: {
      numeroVoie: true,
      repetition: true,
      nomVoie: true,
      nomCommune: true,
      codePostal: true,
      codeInsee: true,
    },
  },
} as const

type LieuRow = {
  structureCartographieNationaleId: string | null
  nom: string
  ficheAccesLibre: string | null
  presentationDetail: string | null
  presentationResume: string | null
  horaires: string | null
  priseRdv: string | null
  source: string | null
  contact: unknown
  typologies: string[]
  services: string[]
  modalitesAcces: string[]
  modalitesAccompagnement: string[]
  publicsSpecifiquementAdresses: string[]
  priseEnChargeSpecifique: string[]
  fraisACharge: string[]
  itinerance: string[]
  adresse: {
    numeroVoie: number | null
    repetition: string | null
    nomVoie: string | null
    nomCommune: string
    codePostal: string
    codeInsee: string
  } | null
}

const joinLabels = (labels: string[]): string | null =>
  labels.length > 0 ? labels.join('|') : null

const contactValue = (
  contact: unknown,
): {
  telephone: string | null
  courriels: string | null
  siteWeb: string | null
} => {
  const record =
    typeof contact === 'object' && contact !== null
      ? (contact as Record<string, unknown>)
      : {}
  const courriels =
    typeof record.courriels === 'object' && record.courriels !== null
      ? ((record.courriels as Record<string, unknown>).email as
          | string
          | undefined)
      : undefined
  return {
    telephone: typeof record.telephone === 'string' ? record.telephone : null,
    courriels: courriels ?? null,
    siteWeb: typeof record.site_web === 'string' ? record.site_web : null,
  }
}

type Coords = { latitude: number | null; longitude: number | null }

// main.adresse.geom est une géométrie postgis (Point, SRID 4326) que Prisma ne sait pas
// sélectionner en typé : on extrait lat/long via ST_Y/ST_X en SQL brut, indexé par cartoId.
const coordsByCartoId = async (
  cartoIds: string[],
): Promise<Map<string, Coords>> => {
  if (cartoIds.length === 0) return new Map()

  const rows = await entrepotPrismaClient.$queryRaw<
    { cartoId: string; latitude: number | null; longitude: number | null }[]
  >`
    SELECT
      li.structure_cartographie_nationale_id AS "cartoId",
      ST_Y(a.geom) AS latitude,
      ST_X(a.geom) AS longitude
    FROM main.lieu_inclusion li
    JOIN main.adresse a ON a.id = li.adresse_id
    WHERE li.structure_cartographie_nationale_id IN (${Prisma.join(cartoIds)})
  `

  return new Map(
    rows.map((row) => [
      row.cartoId,
      { latitude: row.latitude, longitude: row.longitude },
    ]),
  )
}

const toCartoStructure = (
  lieu: LieuRow,
  coords?: Coords,
): CartoStructure | null => {
  if (!lieu.structureCartographieNationaleId) {
    return null
  }
  const { telephone, courriels, siteWeb } = contactValue(lieu.contact)
  return {
    id: lieu.structureCartographieNationaleId,
    nom: lieu.nom,
    adresse: [
      [lieu.adresse?.numeroVoie, lieu.adresse?.repetition]
        .filter(Boolean)
        .join(''),
      lieu.adresse?.nomVoie,
    ]
      .filter(Boolean)
      .join(' '),
    commune: lieu.adresse?.nomCommune ?? '',
    codePostal: lieu.adresse?.codePostal ?? '',
    codeInsee: lieu.adresse?.codeInsee ?? null,
    // SIRET non fiable côté carto → jamais repris
    pivot: '',
    complementAdresse: null,
    longitude: coords?.longitude ?? null,
    latitude: coords?.latitude ?? null,
    ficheAccesLibre: lieu.ficheAccesLibre,
    presentationDetail: lieu.presentationDetail,
    presentationResume: lieu.presentationResume,
    horaires: lieu.horaires,
    source: lieu.source,
    siteWeb,
    telephone,
    courriels,
    typologie: joinLabels(lieu.typologies),
    services: joinLabels(lieu.services),
    modalitesAcces: joinLabels(lieu.modalitesAcces),
    modalitesAccompagnement: joinLabels(lieu.modalitesAccompagnement),
    publicsSpecifiquementAdresses: joinLabels(
      lieu.publicsSpecifiquementAdresses,
    ),
    priseEnChargeSpecifique: joinLabels(lieu.priseEnChargeSpecifique),
    fraisACharge: joinLabels(lieu.fraisACharge),
    itinerance: joinLabels(lieu.itinerance),
  }
}

export const findCartoStructure = async (
  cartoId: string,
): Promise<CartoStructure | null> => {
  const [lieu, coords] = await Promise.all([
    entrepotPrismaClient.lieuInclusion.findUnique({
      where: { structureCartographieNationaleId: cartoId },
      select: lieuSelect,
    }),
    coordsByCartoId([cartoId]),
  ])
  return lieu ? toCartoStructure(lieu, coords.get(cartoId)) : null
}

export const findCartoStructuresByIds = async (
  cartoIds: string[],
): Promise<Map<string, CartoStructure>> => {
  if (cartoIds.length === 0) return new Map()

  const [lieux, coords] = await Promise.all([
    entrepotPrismaClient.lieuInclusion.findMany({
      where: { structureCartographieNationaleId: { in: cartoIds } },
      select: lieuSelect,
    }),
    coordsByCartoId(cartoIds),
  ])

  return new Map(
    lieux
      .map((lieu) =>
        toCartoStructure(
          lieu,
          lieu.structureCartographieNationaleId
            ? coords.get(lieu.structureCartographieNationaleId)
            : undefined,
        ),
      )
      .filter((s): s is CartoStructure => s !== null)
      .map((s) => [s.id, s]),
  )
}
