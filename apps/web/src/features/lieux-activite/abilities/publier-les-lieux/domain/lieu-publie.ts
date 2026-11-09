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

const facultatif = <S extends z.ZodType>(schema: S) =>
  schema.optional().catch(undefined)

export const LieuPublieSchema = z.object({
  id: Id.schema,
  nom: Nom.schema,
  adresse: Adresse.schema,
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
