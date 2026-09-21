import {
  Adresse,
  Contact,
  DispositifProgrammesNationaux,
  FicheAccesLibre,
  FormationsLabels,
  FraisACharge,
  Horaires,
  Id,
  Itinerances,
  Localisation,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  Pivot,
  Presentation,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  sansDoublons,
  Typologies,
  triee,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'

/**
 * Ce que la coop verse à la cartographie nationale, mesuré au standard.
 *
 * L'assemblage est celui de la coop et non celui de la bibliothèque : on compose
 * champ par champ, parce qu'étendre un schéma tout fait ne sait que resserrer.
 *
 * **Un champ facultatif invalide se perd, le lieu reste.** Un horaire illisible
 * ne doit pas faire disparaître un lieu de la carte : il y reste utile sans ses
 * horaires, il n'existe plus du tout s'il est écarté.
 *
 * **Les champs obligatoires bloquent.** Sans identifiant, sans nom ou sans
 * adresse valide, ce n'est pas un lieu diminué : c'est un lieu qu'on ne sait pas
 * désigner, et qu'on ne saurait pas atteindre sur une carte.
 *
 * L'adresse facultative que le domaine `Fiche` admet n'a donc pas cours ici :
 * elle existe pour que la coop garde lisibles des lieux hérités sans adresse,
 * pas pour les publier. Ils étaient d'ailleurs déjà rejetés en aval, à la
 * moisson.
 */
const facultatif = <S extends z.ZodType>(schema: S) =>
  schema.optional().catch(undefined)

export const LieuPublieSchema = z.object({
  id: Id.schema,
  nom: Nom.schema,
  adresse: Adresse.schema,
  /**
   * Un lieu dont on ignore ce qu'il propose n'oriente personne. L'exigence vit
   * dans l'assemblage et non dans le champ : le standard admet une liste vide,
   * c'est la cartographie qui ne s'en contente pas.
   */
  services: Services.schema.refine((services) => services.length > 0, {
    error: 'Un lieu doit annoncer au moins un service',
  }),
  pivot: facultatif(Pivot.schema),
  localisation: facultatif(Localisation.schema),
  typologies: facultatif(Typologies.schema),
  contact: facultatif(Contact.schema),
  horaires: facultatif(Horaires.schema),
  presentation: facultatif(Presentation.schema),
  source: facultatif(z.string().trim().min(1)),
  date_maj: facultatif(z.date()),
  publics_specifiquement_adresses: facultatif(
    PublicsSpecifiquementAdresses.schema,
  ),
  prise_en_charge_specifique: facultatif(PrisesEnChargeSpecifiques.schema),
  modalites_acces: facultatif(ModalitesAcces.schema),
  frais_a_charge: facultatif(FraisACharge.schema),
  itinerance: facultatif(Itinerances.schema),
  dispositif_programmes_nationaux: facultatif(
    DispositifProgrammesNationaux.schema,
  ),
  formations_labels: facultatif(FormationsLabels.schema),
  autres_formations_labels: facultatif(
    z
      .array(z.string().trim().min(1))
      .transform((labels) => triee(sansDoublons(labels))),
  ),
  modalites_accompagnement: facultatif(ModalitesAccompagnement.schema),
  fiche_acces_libre: facultatif(FicheAccesLibre.schema),
  prise_rdv: facultatif(Url.schema),
})

export type LieuPublie = z.output<typeof LieuPublieSchema>
