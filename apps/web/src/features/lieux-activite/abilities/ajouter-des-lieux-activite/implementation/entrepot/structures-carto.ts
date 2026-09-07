import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import type { Fiche } from '@app/web/features/lieux-activite/domain/fiche'
import { IdsCartographieNationale } from '@app/web/features/lieux-activite/domain/ids-cartographie-nationale'
import {
  courrielsValides,
  presentationSaisie,
  sitesWebSaisis,
  telephoneValide,
  urlSaisie,
} from '@app/web/features/lieux-activite/domain/saisie'
import { SourceCartographie } from '@app/web/features/lieux-activite/domain/tracabilite'
import { reconnues } from '@app/web/features/lieux-activite/vocabulaire'
import { coopCartographieNationaleSource } from '@app/web/libraries/cartographie-nationale'
import {
  Contact,
  Frais,
  Itinerance,
  isValidNom,
  ModaliteAcces,
  ModaliteAccompagnement,
  Nom,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuCarto } from '../../domain'

// Lit `main.lieu_inclusion` dans l'Entrepôt et en tire la fiche que la coop
// matérialise. Ni adresse ni coordonnées : celles de l'écran, validées par la
// Base Adresse Nationale, priment toujours sur celles de la cartographie. Le
// SIRET (pivot) n'est pas repris non plus — la cartographie nationale n'en est
// pas une source fiable, seule l'API entreprise fait foi.

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

/** La colonne `contact` est un JSON libre : rien n'y est acquis. */
const contactDeLaLigne = (contact: unknown): Contact => {
  const record =
    typeof contact === 'object' && contact !== null
      ? (contact as Record<string, unknown>)
      : {}
  const courriel =
    typeof record.courriels === 'object' && record.courriels !== null
      ? ((record.courriels as Record<string, unknown>).email as
          | string
          | undefined)
      : undefined

  const telephone = telephoneValide(
    typeof record.telephone === 'string' ? record.telephone : null,
  )
  const courriels = courrielsValides([courriel])
  const sitesWeb = sitesWebSaisis(
    typeof record.site_web === 'string' ? record.site_web : null,
  )

  return Contact({
    ...(telephone == null ? {} : { telephone }),
    ...(courriels.length === 0 ? {} : { courriels: [...courriels] }),
    ...(sitesWeb.length === 0 ? {} : { site_web: [...sitesWeb] }),
  })
}

/**
 * Ce que la cartographie sait dire de la fiche, et rien de plus.
 *
 * Les listes qu'elle ne porte pas — dispositifs, labels de formation — restent
 * vides plutôt que d'être devinées ; `reconnues` écarte des autres les valeurs
 * que le schéma national ne connaît pas.
 */
const ficheDeLaLigne = (lieu: LieuRow): Fiche => ({
  nom: Nom(lieu.nom),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: reconnues(Typologie, lieu.typologies),
  contact: contactDeLaLigne(lieu.contact),
  horaires: lieu.horaires,
  presentation: presentationSaisie(
    lieu.presentationResume,
    lieu.presentationDetail,
  ),
  services: reconnues(Service, lieu.services),
  publicsSpecifiquementAdresses: reconnues(
    PublicSpecifiquementAdresse,
    lieu.publicsSpecifiquementAdresses,
  ),
  priseEnChargeSpecifique: reconnues(
    PriseEnChargeSpecifique,
    lieu.priseEnChargeSpecifique,
  ),
  modalitesAcces: reconnues(ModaliteAcces, lieu.modalitesAcces),
  fraisACharge: reconnues(Frais, lieu.fraisACharge),
  itinerance: reconnues(Itinerance, lieu.itinerance),
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  modalitesAccompagnement: reconnues(
    ModaliteAccompagnement,
    lieu.modalitesAccompagnement,
  ),
  ficheAccesLibre: urlSaisie(lieu.ficheAccesLibre),
  priseRdv: null,
})

/**
 * La coop relisant sa propre publication ne nomme aucun producteur tiers : la
 * fiche n'a alors pas été modifiée de l'extérieur.
 */
const sourceDeLaLigne = (source: string | null): SourceCartographie | null =>
  source == null || source === coopCartographieNationaleSource
    ? null
    : SourceCartographie.safe(source)

/**
 * Une ligne de l'Entrepôt devient un lieu exploitable, ou rien.
 *
 * Sans id de cartographie il n'y a rien à corréler ; sans nom, il n'y a pas de
 * fiche — `Nom` du standard le refuse, et une ligne écartée vaut mieux qu'un
 * import interrompu.
 */
const toLieuCarto = (lieu: LieuRow): LieuCarto | null => {
  const ids =
    lieu.structureCartographieNationaleId == null
      ? null
      : IdsCartographieNationale.safe(lieu.structureCartographieNationaleId)

  if (ids == null || !isValidNom(lieu.nom)) return null

  return {
    idsCartographieNationale: ids,
    source: sourceDeLaLigne(lieu.source),
    fiche: ficheDeLaLigne(lieu),
  }
}

export const findCartoStructuresByIds = async (
  cartoIds: readonly string[],
): Promise<ReadonlyMap<string, LieuCarto>> => {
  if (cartoIds.length === 0) return new Map()

  const lieux = await entrepotPrismaClient.lieuInclusion.findMany({
    where: { structureCartographieNationaleId: { in: [...cartoIds] } },
    select: lieuSelect,
  })

  return new Map(
    lieux
      .map((lieu) => {
        const carto = toLieuCarto(lieu)

        return carto == null || lieu.structureCartographieNationaleId == null
          ? null
          : ([lieu.structureCartographieNationaleId, carto] as const)
      })
      .filter((entree) => entree !== null),
  )
}
