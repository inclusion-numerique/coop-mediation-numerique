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
 * Elle porte son inscription au registre de l'Entrepôt, d'où vient DÉSORMAIS la
 * fiche entière : nom, adresse, contact, horaires, présentation, nomenclatures.
 * La coop reste l'ancre — c'est elle qui porte l'identifiant, les rattachements,
 * le pivot et la traçabilité — mais elle n'est plus lue pour ce que le lieu
 * déclare de lui-même.
 *
 * Le type l'exige : une requête qui oublierait d'inclure l'inscription ne
 * compile pas, plutôt que de rendre un lieu dont la fiche serait celle d'hier.
 */
export type LigneDuLieu = [Divergences] extends [never]
  ? LieuInclusion & {
      readonly inscriptionRegistre: InscriptionPourLaFiche | null
    }
  : { readonly VOCABULAIRE_DESALIGNE_AVEC_LE_SCHEMA: Divergences }

/**
 * La ligne telle que la COOP la porte, pour l'écriture au registre.
 *
 * Distincte de `LigneDuLieu`, et la distinction n'est pas une commodité de
 * typage : y lire la fiche du registre reviendrait, au moment de pousser une
 * fiche coop nouvellement créée, à relire les valeurs déjà inscrites et à les
 * réécrire telles quelles. Une adoption n'inscrirait alors jamais ce que le
 * médiateur vient de saisir.
 *
 * Elle ne porte de l'inscription que l'identité cartographique, qui sert à
 * reconnaître la ligne à adopter.
 */
export type LigneDuLieuCoop = [Divergences] extends [never]
  ? LieuInclusion & {
      readonly inscriptionRegistre: {
        readonly structureCartographieNationaleId: string | null
      } | null
    }
  : { readonly VOCABULAIRE_DESALIGNE_AVEC_LE_SCHEMA: Divergences }
