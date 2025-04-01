import type { FraisAChargeLabel } from '@app/web/app/structure/fraisACharge'
import { validateValidRnaDigits } from '@app/web/rna/rnaValidation'
import { validateValidSiretDigits } from '@app/web/siret/siretValidation'
import type {
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  Prisma,
  PublicSpecifiquementAdresse,
  Service,
  StructureCartographieNationale,
  Typologie,
} from '@prisma/client'
import { v4 } from 'uuid'

export const toStructureFromCartoStructure = ({
  adresse,
  codeInsee,
  codePostal,
  commune,
  complementAdresse,
  courriels,
  ficheAccesLibre,
  fraisACharge,
  horaires,
  id,
  itinerance,
  latitude,
  longitude,
  modalitesAcces,
  modalitesAccompagnement,
  nom,
  pivot,
  presentationDetail,
  presentationResume,
  priseEnChargeSpecifique,
  publicsSpecifiquementAdresses,
  services,
  siteWeb,
  telephone,
  typologie,
}: Pick<
  StructureCartographieNationale,
  | 'id'
  | 'nom'
  | 'adresse'
  | 'commune'
  | 'codePostal'
  | 'pivot'
  | 'codeInsee'
  | 'longitude'
  | 'latitude'
  | 'ficheAccesLibre'
  | 'presentationDetail'
  | 'presentationResume'
  | 'complementAdresse'
  | 'horaires'
  | 'siteWeb'
  | 'typologie'
  | 'modalitesAccompagnement'
  | 'services'
  | 'modalitesAcces'
  | 'fraisACharge'
  | 'itinerance'
  | 'priseEnChargeSpecifique'
  | 'publicsSpecifiquementAdresses'
  | 'courriels'
  | 'telephone'
>) =>
  ({
    id: v4(),
    structureCartographieNationaleId: id,
    visiblePourCartographieNationale: true,
    nom,
    adresse,
    complementAdresse,
    commune,
    codePostal,
    siret: pivot && validateValidSiretDigits(pivot) ? pivot : null,
    rna: pivot && validateValidRnaDigits(pivot) ? pivot : null,
    codeInsee,
    longitude,
    latitude,
    ficheAccesLibre,
    services: services?.split('|') as Service[] | undefined,
    horaires,
    typologies: typologie?.split('|') as Typologie[] | undefined,
    presentationResume,
    presentationDetail,
    courriels: courriels?.split('|'),
    telephone,
    siteWeb,
    modalitesAccompagnement: modalitesAccompagnement?.split('|') as
      | ModaliteAccompagnement[]
      | undefined,
    modalitesAcces: modalitesAcces?.split('|') as ModaliteAcces[] | undefined,
    fraisACharge: fraisACharge?.split('|') as FraisAChargeLabel[] | undefined,
    itinerance: itinerance?.split('|') as Itinerance[] | undefined,
    priseEnChargeSpecifique: priseEnChargeSpecifique?.split('|') as
      | PriseEnChargeSpecifique[]
      | undefined,
    publicsSpecifiquementAdresses: publicsSpecifiquementAdresses?.split('|') as
      | PublicSpecifiquementAdresse[]
      | undefined,
  }) satisfies Prisma.StructureCreateManyInput
