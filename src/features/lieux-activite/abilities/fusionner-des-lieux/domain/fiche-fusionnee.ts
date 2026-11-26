import {
  Contact,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  ModalitesAcces,
  ModalitesAccompagnement,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  estPublie,
  VisibiliteCartographie,
} from '../../../domain/cartographie-nationale/visibilite-cartographie'
import type { Fiche } from '../../../domain/fiche'
import type { FicheFusionnable, HeritageDeLaFiche } from './fiche-fusionnable'

const cumuler = <Valeur>(
  cible: readonly Valeur[],
  source: readonly Valeur[],
): Valeur[] => [...new Set([...cible, ...source])]

const contactCumule = (
  source: Fiche['contact'],
  cible: Fiche['contact'],
): Fiche['contact'] => {
  const courriels = cumuler(cible.courriels ?? [], source.courriels ?? [])

  return Contact({
    ...cible,
    ...(courriels.length === 0 ? { courriels: undefined } : { courriels }),
  })
}

const ficheCumulee = (source: Fiche, cible: Fiche): Fiche => ({
  ...cible,
  typologies: Typologies(cumuler(cible.typologies, source.typologies)),
  services: Services(cumuler(cible.services, source.services)),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses(
    cumuler(
      cible.publicsSpecifiquementAdresses,
      source.publicsSpecifiquementAdresses,
    ),
  ),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques(
    cumuler(cible.priseEnChargeSpecifique, source.priseEnChargeSpecifique),
  ),
  fraisACharge: FraisACharge(cumuler(cible.fraisACharge, source.fraisACharge)),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux(
    cumuler(
      cible.dispositifProgrammesNationaux,
      source.dispositifProgrammesNationaux,
    ),
  ),
  formationsLabels: FormationsLabels(
    cumuler(cible.formationsLabels, source.formationsLabels),
  ),
  autresFormationsLabels: cumuler(
    cible.autresFormationsLabels,
    source.autresFormationsLabels,
  ),
  itinerance: Itinerances(cumuler(cible.itinerance, source.itinerance)),
  modalitesAcces: ModalitesAcces(
    cumuler(cible.modalitesAcces, source.modalitesAcces),
  ),
  modalitesAccompagnement: ModalitesAccompagnement(
    cumuler(cible.modalitesAccompagnement, source.modalitesAccompagnement),
  ),
  contact: contactCumule(source.contact, cible.contact),
})

const heritee = (
  source: HeritageDeLaFiche,
  cible: HeritageDeLaFiche,
): HeritageDeLaFiche => ({
  nomReferent: cible.nomReferent ?? source.nomReferent,
  courrielReferent: cible.courrielReferent ?? source.courrielReferent,
  telephoneReferent: cible.telephoneReferent ?? source.telephoneReferent,
  v1Imported: cible.v1Imported ?? source.v1Imported,
  v1StructureId: cible.v1StructureId ?? source.v1StructureId,
  v1StructureIdPg: cible.v1StructureIdPg ?? source.v1StructureIdPg,
  v1PermanenceId: cible.v1PermanenceId ?? source.v1PermanenceId,
})

export const ficheFusionnee = (
  source: FicheFusionnable,
  cible: FicheFusionnable,
): FicheFusionnable => ({
  lieu: {
    ...cible.lieu,
    fiche: ficheCumulee(source.lieu.fiche, cible.lieu.fiche),
    visibilite:
      estPublie(cible.lieu.visibilite) && estPublie(source.lieu.visibilite)
        ? VisibiliteCartographie('Publie')
        : VisibiliteCartographie('NonPublie'),
  },
  heritage: heritee(source.heritage, cible.heritage),
})
