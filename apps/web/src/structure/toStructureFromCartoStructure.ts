import { fraisAChargeKeys } from '@app/web/app/structure/fraisACharge'
import { itineranceKeys } from '@app/web/app/structure/itinerance'
import { modaliteAccompagnementKeys } from '@app/web/app/structure/modaliteAccompagnement'
import { modaliteAccesKeys } from '@app/web/app/structure/modalitesAcces'
import { priseEnChargeSpecifiqueKeys } from '@app/web/app/structure/priseEnChargeSpecifique'
import { publicSpecifiquementAdresseKeys } from '@app/web/app/structure/publicSpecifiquementAdresse'
import { serviceKeys } from '@app/web/app/structure/service'
import { validateValidRnaDigits } from '@app/web/rna/rnaValidation'
import { validateValidSiretDigits } from '@app/web/siret/siretValidation'
import type {
  Frais,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type {
  Prisma,
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
    services: services
      ?.split('|')
      .map((serviceLabel) => serviceKeys[serviceLabel as Service]),
    horaires,
    typologies: typologie?.split('|') as Typologie[] | undefined,
    presentationResume,
    presentationDetail,
    courriels: courriels?.split('|'),
    telephone,
    siteWeb,
    modalitesAccompagnement: modalitesAccompagnement
      ?.split('|')
      .map(
        (modaliteAccompagnement) =>
          modaliteAccompagnementKeys[
            modaliteAccompagnement as ModaliteAccompagnement
          ],
      ),
    modalitesAcces: modalitesAcces
      ?.split('|')
      .map(
        (modaliteAcces) => modaliteAccesKeys[modaliteAcces as ModaliteAcces],
      ),
    fraisACharge: fraisACharge
      ?.split('|')
      .map((frais) => fraisAChargeKeys[frais as Frais]),
    itinerance: itinerance
      ?.split('|')
      .map((itineranceLabel) => itineranceKeys[itineranceLabel as Itinerance]),
    priseEnChargeSpecifique: priseEnChargeSpecifique
      ?.split('|')
      .map(
        (priseEnCharge) =>
          priseEnChargeSpecifiqueKeys[priseEnCharge as PriseEnChargeSpecifique],
      ),
    publicsSpecifiquementAdresses: publicsSpecifiquementAdresses
      ?.split('|')
      .map(
        (publicSpecifiquementAdresse) =>
          publicSpecifiquementAdresseKeys[
            publicSpecifiquementAdresse as PublicSpecifiquementAdresse
          ],
      ),
  }) satisfies Prisma.StructureCreateManyInput
