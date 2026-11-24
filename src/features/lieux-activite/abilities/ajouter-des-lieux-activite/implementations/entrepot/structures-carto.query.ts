import {
  Contact,
  DispositifProgrammesNationaux,
  FormationsLabels,
  Frais,
  FraisACharge,
  Itinerance,
  Itinerances,
  ModaliteAcces,
  ModaliteAccompagnement,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PriseEnChargeSpecifique,
  PrisesEnChargeSpecifiques,
  PublicSpecifiquementAdresse,
  PublicsSpecifiquementAdresses,
  Service,
  Services,
  Typologie,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'
import { entrepotPrismaClient } from '@/configuration/prisma/entrepotPrismaClient'
import { IdsCartographieNationale } from '@/features/lieux-activite/domain/cartographie-nationale/ids-cartographie-nationale'
import { coopCartographieNationaleSource } from '@/features/lieux-activite/domain/cartographie-nationale/sources'
import type { Fiche } from '@/features/lieux-activite/domain/fiche'
import { reconnues } from '@/features/lieux-activite/domain/nomenclatures'
import { SourceCartographie } from '@/features/lieux-activite/domain/registre/tracabilite'
import {
  courrielsValides,
  ficheAccesLibreSaisie,
  horairesDeLaSource,
  presentationSaisie,
  sitesWebSaisis,
  telephoneValide,
} from '@/features/lieux-activite/domain/saisie/saisie'
import type { LieuCarto } from '../../domain'

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

const ContactDeLaLigne = z
  .object({
    telephone: z.string().nullish().catch(null),
    courriels: z
      .object({ email: z.string().nullish().catch(null) })
      .nullish()
      .catch(null),
    site_web: z.string().nullish().catch(null),
  })
  .catch({ telephone: null, courriels: null, site_web: null })

const contactDeLaLigne = (contact: unknown): Contact => {
  const lu = ContactDeLaLigne.parse(contact)

  const telephone = telephoneValide(lu.telephone ?? null)
  const courriels = courrielsValides([lu.courriels?.email ?? undefined])
  const sitesWeb = sitesWebSaisis(lu.site_web ?? null)

  return Contact({
    ...(telephone == null ? {} : { telephone }),
    ...(courriels.length === 0 ? {} : { courriels: [...courriels] }),
    ...(sitesWeb.length === 0 ? {} : { site_web: [...sitesWeb] }),
  })
}

const ficheDeLaLigne = (lieu: LieuRow): Fiche => ({
  nom: Nom(lieu.nom),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: Typologies(reconnues(Typologie, lieu.typologies)),
  contact: contactDeLaLigne(lieu.contact),
  horaires: horairesDeLaSource(lieu.horaires),
  presentation: presentationSaisie(
    lieu.presentationResume,
    lieu.presentationDetail,
  ),
  services: Services(reconnues(Service, lieu.services)),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses(
    reconnues(PublicSpecifiquementAdresse, lieu.publicsSpecifiquementAdresses),
  ),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques(
    reconnues(PriseEnChargeSpecifique, lieu.priseEnChargeSpecifique),
  ),
  modalitesAcces: ModalitesAcces(reconnues(ModaliteAcces, lieu.modalitesAcces)),
  fraisACharge: FraisACharge(reconnues(Frais, lieu.fraisACharge)),
  itinerance: Itinerances(reconnues(Itinerance, lieu.itinerance)),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux([]),
  formationsLabels: FormationsLabels([]),
  autresFormationsLabels: [],
  modalitesAccompagnement: ModalitesAccompagnement(
    reconnues(ModaliteAccompagnement, lieu.modalitesAccompagnement),
  ),
  ficheAccesLibre: ficheAccesLibreSaisie(lieu.ficheAccesLibre),
  priseRdv: null,
})

const sourceDeLaLigne = (source: string | null): SourceCartographie | null =>
  source == null || source === coopCartographieNationaleSource
    ? null
    : SourceCartographie.safe(source)

const toLieuCarto = (lieu: LieuRow): LieuCarto | null => {
  const ids =
    lieu.structureCartographieNationaleId == null
      ? null
      : IdsCartographieNationale.safe(lieu.structureCartographieNationaleId)

  if (ids == null || Nom.safe(lieu.nom) == null) return null

  return {
    idsCartographieNationale: ids,
    source: sourceDeLaLigne(lieu.source),
    fiche: ficheDeLaLigne(lieu),
  }
}

export const structuresCartoParIds = async (
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
