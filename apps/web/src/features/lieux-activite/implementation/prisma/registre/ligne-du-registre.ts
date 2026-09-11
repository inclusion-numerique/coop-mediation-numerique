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
} from '../vocabulaire'

/**
 * La même garde que `ligne-du-lieu.ts`, tournée vers le registre de l'Entrepôt.
 *
 * Écrire aux deux endroits n'a de sens que si les deux acceptent exactement les
 * mêmes valeurs : les nomenclatures de `main` et celles de `coop` sont
 * aujourd'hui identiques, libellé pour libellé, et c'est cette identité qui
 * autorise la double écriture à ne traduire qu'une fois. Elle n'est garantie par
 * rien d'autre que le fait — les deux schémas appartiennent à des équipes
 * différentes, et le nôtre n'a aucune autorité sur `main`.
 *
 * Tant que l'union reste vide, `LigneDuRegistre` est la ligne du schéma et le
 * transfer compile. Dès qu'une valeur bouge d'un côté sans l'autre — un
 * producteur ajoute une typologie, la coop en renomme une — `LigneDuRegistre`
 * devient le marqueur ci-dessous : plus aucune ligne ne s'y assigne, et `tsc`
 * s'arrête en nommant le membre fautif, avant que l'écriture ne parte en base
 * pour y échouer à l'exécution.
 */
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

/**
 * Une ligne du registre telle que la base la rend, dont les nomenclatures sont
 * prouvées alignées sur le vocabulaire de la coop.
 */
export type LigneDuRegistre = [Divergences] extends [never]
  ? LieuInclusionRegistreMain
  : { readonly VOCABULAIRE_DESALIGNE_AVEC_LE_REGISTRE: Divergences }

/**
 * Le marqueur ne sert que s'il se voit. Atteint par un `Pick`, il se dégrade en
 * « `unknown` n'est pas assignable à `string` » quelque part dans le transfer,
 * ce qui arrête bien la compilation mais ne dit pas pourquoi. Cette assertion
 * échoue la première, et en nommant la valeur fautive.
 */
export const nomenclaturesAlignees: [Divergences] extends [never]
  ? true
  : { readonly VOCABULAIRE_DESALIGNE_AVEC_LE_REGISTRE: Divergences } = true
