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
} from '@prisma/client'
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

/**
 * Les noms que la coop donne à ses nomenclatures et ceux que la base stocke
 * doivent désigner exactement les mêmes valeurs. Le vocabulaire déclare les
 * siens sans rien emprunter au client Prisma, et c'est ici — le seul endroit de
 * la feature qui ait le droit de regarder le schéma — qu'on vérifie qu'ils
 * coïncident.
 *
 * `Ecart` recense, pour chaque nomenclature, ce que l'un a et l'autre pas. Tant
 * que l'union reste vide, `LigneDuLieu` est la ligne du schéma et le transfer
 * compile. Dès qu'une valeur est ajoutée, retirée ou renommée d'un côté sans
 * l'autre, `LigneDuLieu` devient le marqueur ci-dessous : plus aucune ligne ne
 * s'y assigne, et `tsc` s'arrête en nommant le membre fautif.
 */
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

/**
 * Une ligne de lieu telle que la base la rend, dont les nomenclatures sont
 * prouvées alignées sur le vocabulaire de la coop.
 *
 * Elle porte son inscription au registre de l'Entrepôt, où vit désormais
 * l'identité cartographique du lieu — la coop en tenait une copie, retirée
 * depuis. Le type l'exige : une requête qui oublierait de l'inclure ne compile
 * pas, plutôt que de rendre un lieu sans identité.
 */
export type LigneDuLieu = [Divergences] extends [never]
  ? LieuInclusion & {
      readonly inscriptionRegistre: {
        readonly structureCartographieNationaleId: string | null
      } | null
    }
  : { readonly VOCABULAIRE_DESALIGNE_AVEC_LE_SCHEMA: Divergences }
