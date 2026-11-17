import type {
  DispositifProgrammeNationalMain,
  FormationLabelMain,
  FraisAChargeMain,
  ItineranceMain,
  LieuInclusionRegistreMain,
  ModaliteAccesMain,
  ModaliteAccompagnementMain,
  PriseEnChargeSpecifiqueMain,
  PublicSpecifiquementAdresseMain,
  ServiceMain,
  TypologieMain,
} from '@app/web/generated/prisma/client'
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
} from '../vocabulaire'

type Ecart<Coop extends string, Colonne extends string> =
  | Exclude<Coop, Colonne>
  | Exclude<Colonne, Coop>

type Divergences =
  | Ecart<TypologieCoop, TypologieMain>
  | Ecart<ServiceCoop, ServiceMain>
  | Ecart<PublicSpecifiquementAdresseCoop, PublicSpecifiquementAdresseMain>
  | Ecart<PriseEnChargeSpecifiqueCoop, PriseEnChargeSpecifiqueMain>
  | Ecart<ModaliteAccesCoop, ModaliteAccesMain>
  | Ecart<ModaliteAccompagnementCoop, ModaliteAccompagnementMain>
  | Ecart<FraisAChargeCoop, FraisAChargeMain>
  | Ecart<ItineranceCoop, ItineranceMain>
  | Ecart<DispositifProgrammeNationalCoop, DispositifProgrammeNationalMain>
  | Ecart<FormationLabelCoop, FormationLabelMain>

export type LigneDuRegistre = [Divergences] extends [never]
  ? LieuInclusionRegistreMain
  : { readonly VOCABULAIRE_DESALIGNE_AVEC_LE_REGISTRE: Divergences }

export const nomenclaturesAlignees: [Divergences] extends [never]
  ? true
  : { readonly VOCABULAIRE_DESALIGNE_AVEC_LE_REGISTRE: Divergences } = true
