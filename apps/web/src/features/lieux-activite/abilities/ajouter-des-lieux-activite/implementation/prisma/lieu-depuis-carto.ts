import * as vocabulaire from '@app/web/features/lieux-activite/vocabulaire'
import { validateValidRnaDigits } from '@app/web/libraries/rna'
import { validateValidSiretDigits } from '@app/web/libraries/siret'
import { coopCartographieNationaleSource } from '@app/web/structure/cartographieNationaleSources'
import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import type { CartoStructure } from '../../domain'

/**
 * Traduit une liste du schéma national vers les noms d'enum de la coop, en
 * écartant ce qui n'a pas d'équivalent. Les tables de correspondance vivent au
 * niveau de la feature : la cartographie et la saisie décrivent le même objet,
 * elles ne peuvent pas en avoir deux vocabulaires.
 */
const versCoop = <Standard extends string, Coop extends string>(
  valeurs: readonly Standard[],
  table: { versCoop: (valeur: Standard) => Coop | null },
): Coop[] => [...vocabulaire.traduites(valeurs, table.versCoop)]

/** Les colonnes d'un lieu de la coop, depuis une structure de la cartographie. */
export const lieuDepuisCarto = ({
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
  localisation,
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
  typologies,
}: CartoStructure) =>
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
    longitude: localisation?.longitude ?? null,
    latitude: localisation?.latitude ?? null,
    ficheAccesLibre,
    horaires,
    presentationResume,
    presentationDetail,
    courriels: [...courriels],
    telephone,
    siteWeb,
    derniereModificationSource:
      source === coopCartographieNationaleSource ? null : source,
    typologies: versCoop(typologies, vocabulaire.typologie),
    services: versCoop(services, vocabulaire.service),
    modalitesAcces: versCoop(modalitesAcces, vocabulaire.modaliteAcces),
    modalitesAccompagnement: versCoop(
      modalitesAccompagnement,
      vocabulaire.modaliteAccompagnement,
    ),
    publicsSpecifiquementAdresses: versCoop(
      publicsSpecifiquementAdresses,
      vocabulaire.publicSpecifiquementAdresse,
    ),
    priseEnChargeSpecifique: versCoop(
      priseEnChargeSpecifique,
      vocabulaire.priseEnChargeSpecifique,
    ),
    fraisACharge: versCoop(fraisACharge, vocabulaire.fraisACharge),
    itinerance: versCoop(itinerance, vocabulaire.itinerance),
  }) satisfies Prisma.LieuInclusionCreateManyInput
