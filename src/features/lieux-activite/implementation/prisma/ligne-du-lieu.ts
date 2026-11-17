import type {
  DispositifProgrammeNational,
  FormationLabel,
  FraisACharge,
  Itinerance,
  LieuInclusion,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@app/web/generated/prisma/client'
import type { InscriptionPourLaFiche } from './registre/fiche-du-registre'
import type {
  DispositifProgrammeNationalCoop,
  FormationLabelCoop,
  FraisAChargeCoop,
  ItineranceCoop,
  ModaliteAccesCoop,
  ModaliteAccompagnementCoop,
  PriseEnChargeSpecifiqueCoop,
  PublicSpecifiquementAdresseCoop,
  ServiceCoop,
  TypologieCoop,
} from './vocabulaire'

type Ecart<Coop extends string, Colonne extends string> =
  | Exclude<Coop, Colonne>
  | Exclude<Colonne, Coop>

type Divergences =
  | Ecart<TypologieCoop, Typologie>
  | Ecart<ServiceCoop, Service>
  | Ecart<PublicSpecifiquementAdresseCoop, PublicSpecifiquementAdresse>
  | Ecart<PriseEnChargeSpecifiqueCoop, PriseEnChargeSpecifique>
  | Ecart<ModaliteAccesCoop, ModaliteAcces>
  | Ecart<ModaliteAccompagnementCoop, ModaliteAccompagnement>
  | Ecart<FraisAChargeCoop, FraisACharge>
  | Ecart<ItineranceCoop, Itinerance>
  | Ecart<DispositifProgrammeNationalCoop, DispositifProgrammeNational>
  | Ecart<FormationLabelCoop, FormationLabel>

export type LigneDuLieu = [Divergences] extends [never]
  ? LieuInclusion & {
      readonly inscriptionRegistre: InscriptionPourLaFiche | null
    }
  : { readonly VOCABULAIRE_DESALIGNE_AVEC_LE_SCHEMA: Divergences }

export type LigneDuLieuCoop = [Divergences] extends [never]
  ? LieuInclusion & {
      readonly inscriptionRegistre: {
        readonly structureCartographieNationaleId: string | null
      } | null
    }
  : { readonly VOCABULAIRE_DESALIGNE_AVEC_LE_SCHEMA: Divergences }
