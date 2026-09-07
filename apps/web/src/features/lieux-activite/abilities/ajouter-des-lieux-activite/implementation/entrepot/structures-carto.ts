import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { reconnues } from '@app/web/features/lieux-activite/vocabulaire'
import {
  Frais,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { CartoStructure } from '../../domain'

// Reconstruit une CartoStructure (la fiche attendue par l'import "ajouter un lieu
// d'activité") à partir d'une ligne `main.lieu_inclusion` de l'Entrepôt.
// Ni adresse ni coordonnées : celles de l'écran, validées par la Base Adresse
// Nationale, priment toujours sur celles de la cartographie. Le SIRET (pivot) n'est
// pas repris non plus — la cartographie nationale n'en est pas une source fiable,
// seule l'API entreprise fait foi.

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
}

const contactValue = (
  contact: unknown,
): {
  telephone: string | null
  courriels: readonly string[]
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
    courriels: courriels == null ? [] : [courriels],
    siteWeb: typeof record.site_web === 'string' ? record.site_web : null,
  }
}

const toCartoStructure = (lieu: LieuRow): CartoStructure | null => {
  if (!lieu.structureCartographieNationaleId) {
    return null
  }
  const { telephone, courriels, siteWeb } = contactValue(lieu.contact)
  return {
    id: lieu.structureCartographieNationaleId,
    nom: lieu.nom,
    ficheAccesLibre: lieu.ficheAccesLibre,
    presentationDetail: lieu.presentationDetail,
    presentationResume: lieu.presentationResume,
    horaires: lieu.horaires,
    source: lieu.source,
    siteWeb,
    telephone,
    courriels,
    typologies: reconnues(Typologie, lieu.typologies),
    services: reconnues(Service, lieu.services),
    modalitesAcces: reconnues(ModaliteAcces, lieu.modalitesAcces),
    modalitesAccompagnement: reconnues(
      ModaliteAccompagnement,
      lieu.modalitesAccompagnement,
    ),
    publicsSpecifiquementAdresses: reconnues(
      PublicSpecifiquementAdresse,
      lieu.publicsSpecifiquementAdresses,
    ),
    priseEnChargeSpecifique: reconnues(
      PriseEnChargeSpecifique,
      lieu.priseEnChargeSpecifique,
    ),
    fraisACharge: reconnues(Frais, lieu.fraisACharge),
    itinerance: reconnues(Itinerance, lieu.itinerance),
  }
}

export const findCartoStructuresByIds = async (
  cartoIds: string[],
): Promise<Map<string, CartoStructure>> => {
  if (cartoIds.length === 0) return new Map()

  const lieux = await entrepotPrismaClient.lieuInclusion.findMany({
    where: { structureCartographieNationaleId: { in: cartoIds } },
    select: lieuSelect,
  })

  return new Map(
    lieux
      .map(toCartoStructure)
      .filter((s): s is CartoStructure => s !== null)
      .map((s) => [s.id, s]),
  )
}
