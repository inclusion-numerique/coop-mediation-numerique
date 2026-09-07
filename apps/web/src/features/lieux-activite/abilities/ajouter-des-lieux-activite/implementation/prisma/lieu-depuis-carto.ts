import * as vocabulaire from '@app/web/features/lieux-activite/vocabulaire'
import { coopCartographieNationaleSource } from '@app/web/libraries/cartographie-nationale'
import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import type { AdresseValidee, CartoStructure } from '../../domain'

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

/**
 * Les colonnes d'un lieu de la coop, depuis une structure de la cartographie —
 * toutes sauf celles de l'adresse, que l'appelant complète avec celle que la
 * Base Adresse Nationale a validée. C'est ce que dit l'`Omit` : la cartographie
 * décrit le lieu, elle ne le situe pas.
 */
export const lieuDepuisCarto = ({
  courriels,
  ficheAccesLibre,
  fraisACharge,
  horaires,
  id,
  itinerance,
  modalitesAcces,
  modalitesAccompagnement,
  nom,
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
  }) satisfies Omit<Prisma.LieuInclusionCreateManyInput, keyof AdresseValidee>
