import { fraisAChargeKeys } from '@app/web/features/structures/fraisACharge'
import { itineranceKeys } from '@app/web/features/structures/itinerance'
import { modaliteAccompagnementKeys } from '@app/web/features/structures/modaliteAccompagnement'
import { modaliteAccesKeys } from '@app/web/features/structures/modalitesAcces'
import { priseEnChargeSpecifiqueKeys } from '@app/web/features/structures/priseEnChargeSpecifique'
import { publicSpecifiquementAdresseKeys } from '@app/web/features/structures/publicSpecifiquementAdresse'
import { validateValidRnaDigits } from '@app/web/features/structures/rna/rnaValidation'
import { serviceKeys } from '@app/web/features/structures/service'
import { validateValidSiretDigits } from '@app/web/features/structures/siret/siretValidation'
import { coopCartographieNationaleSource } from '@app/web/structure/cartographieNationaleSources'
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
  source,
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
  | 'source'
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
    derniereModificationSource:
      source === coopCartographieNationaleSource ? null : source,
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
