import {
  type Contact,
  isSiret,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { serialiserIdsCartographieNationale } from '../../../domain/ids-cartographie-nationale'
import type { Lieu } from '../../../domain/lieu'
import { estPublie } from '../../../domain/visibilite-cartographie'
import * as vocabulaire from '../vocabulaire'
import type { LigneDuRegistre } from './ligne-du-registre'

/** Le séparateur multi-valeurs du schéma national. */
const SEPARATEUR_LISTE = '|'

/**
 * Les nomenclatures du registre acceptent les mêmes valeurs que celles de la
 * coop — `ligne-du-registre.ts` en fait une garde de compilation. On traduit
 * donc une seule fois, depuis le standard, et le résultat sert aux deux
 * écritures : c'est ce qui garantit qu'elles disent la même chose.
 *
 * Le tableau est recopié parce que `traduites` rend un `readonly`, que Prisma
 * n'accepte pas en écriture.
 */
const nomenclature = <Standard, Colonne>(
  valeurs: readonly Standard[],
  traduction: (valeur: Standard) => Colonne | null,
): Colonne[] => [...vocabulaire.traduites(valeurs, traduction)]

/**
 * Le registre range en un seul `jsonb` ce que la coop tient en trois colonnes.
 * La forme reproduit celle qu'y écrivent les autres sources : les courriels y
 * sont un objet à une clé `email`, valeurs jointes par le séparateur du
 * standard, et les clés absentes ne sont pas posées à `null` — on les omet.
 */
const contactDuRegistre = (contact: Contact) => {
  const courriels = contact.courriels ?? []
  const sitesWeb = contact.site_web ?? []

  return {
    ...(contact.telephone == null ? {} : { telephone: contact.telephone }),
    ...(courriels.length === 0
      ? {}
      : { courriels: { email: courriels.join(SEPARATEUR_LISTE) } }),
    ...(sitesWeb.length === 0
      ? {}
      : { site_web: sitesWeb.join(SEPARATEUR_LISTE) }),
  }
}

/**
 * Le SIRET tel que la coop l'a déclaré. Le registre ne porte pas de RNA et son
 * SIRET n'est qu'une entrée déclarative pour l'enrichissement : le SIRET
 * canonique reste celui de la `structure_administrative` associée. Un pivot qui
 * est un RNA n'a donc pas de colonne où aller, et c'est juste ainsi.
 */
const siretDeclare = (lieu: Lieu): string | null =>
  lieu.fiche.pivot != null && isSiret(lieu.fiche.pivot)
    ? lieu.fiche.pivot
    : null

/**
 * Les colonnes que la coop écrit au registre, prises à la ligne réelle : c'est
 * par ce `Pick` que la garde d'alignement des nomenclatures entre en vigueur —
 * si l'une des deux bouge, le type de la ligne devient le marqueur d'écart et
 * plus rien ici ne compile.
 *
 * `contact` en est exclu : la colonne est un `jsonb`, que Prisma type en lecture
 * (`JsonValue`) et en écriture (`InputJsonValue`) différemment.
 *
 * En sont exclus aussi `dispositif_programmes_nationaux` et
 * `autres_formations_labels`, qu'AUCUN formulaire de la coop ne porte — ni la
 * création, qui les pose à `[]`, ni les sept sections de la modification. Les
 * écrire reviendrait à vider ce que d'autres producteurs y ont mis : 4 841
 * inscriptions renseignent les labels, 2 854 les dispositifs. Ce que la coop ne
 * sait pas dire, elle ne l'écrase pas — et l'omission est ici tenue par le
 * compilateur, non par la vigilance de l'appelant.
 */
export type ColonnesDuRegistre = Pick<
  LigneDuRegistre,
  | 'nom'
  | 'nomUsage'
  | 'complementAdresse'
  | 'visiblePourCartographieNationale'
  | 'ficheAccesLibre'
  | 'priseRdv'
  | 'horaires'
  | 'presentationResume'
  | 'presentationDetail'
  | 'siretALEnrichissement'
  | 'structureCartographieNationaleId'
  | 'typologies'
  | 'services'
  | 'publicsSpecifiquementAdresses'
  | 'priseEnChargeSpecifique'
  | 'modalitesAcces'
  | 'fraisACharge'
  | 'itinerance'
  | 'formationsLabels'
  | 'modalitesAccompagnement'
> & { readonly contact: ReturnType<typeof contactDuRegistre> }

/**
 * Le lieu, dit dans les colonnes du registre.
 *
 * N'y figure pas ce que la coop garde en propre et que le registre n'accueille
 * pas — latitude, longitude, `ban_id`, RNA, champs référent, compteurs — ni
 * l'adresse, qui vit dans `main.adresse` et se résout à part
 * (`adresse-du-registre.ts`), ni les compteurs `mediateurs_en_activite` et
 * `emplois`, entretenus par le flux quotidien de l'Entrepôt. Ni les deux
 * nomenclatures que la coop ne sait pas saisir, cf. `ColonnesDuRegistre`.
 */
export const lieuVersRegistre = (lieu: Lieu): ColonnesDuRegistre => {
  const { fiche, visibilite, idsCartographieNationale, identiteSirene } = lieu

  return {
    nom: fiche.nom,
    nomUsage: identiteSirene.nomUsage,
    complementAdresse: fiche.adresse?.complement_adresse ?? null,
    visiblePourCartographieNationale: estPublie(visibilite),
    ficheAccesLibre: fiche.ficheAccesLibre,
    priseRdv: fiche.priseRdv,
    horaires: fiche.horaires,
    presentationResume: fiche.presentation?.resume ?? null,
    presentationDetail: fiche.presentation?.detail ?? null,
    contact: contactDuRegistre(fiche.contact),
    siretALEnrichissement: siretDeclare(lieu),
    structureCartographieNationaleId:
      idsCartographieNationale == null
        ? null
        : serialiserIdsCartographieNationale(idsCartographieNationale),
    typologies: nomenclature(fiche.typologies, vocabulaire.typologie.versCoop),
    services: nomenclature(fiche.services, vocabulaire.service.versCoop),
    publicsSpecifiquementAdresses: nomenclature(
      fiche.publicsSpecifiquementAdresses,
      vocabulaire.publicSpecifiquementAdresse.versCoop,
    ),
    priseEnChargeSpecifique: nomenclature(
      fiche.priseEnChargeSpecifique,
      vocabulaire.priseEnChargeSpecifique.versCoop,
    ),
    modalitesAcces: nomenclature(
      fiche.modalitesAcces,
      vocabulaire.modaliteAcces.versCoop,
    ),
    fraisACharge: nomenclature(
      fiche.fraisACharge,
      vocabulaire.fraisACharge.versCoop,
    ),
    itinerance: nomenclature(fiche.itinerance, vocabulaire.itinerance.versCoop),
    formationsLabels: nomenclature(
      fiche.formationsLabels,
      vocabulaire.formationLabel.versCoop,
    ),
    modalitesAccompagnement: nomenclature(
      fiche.modalitesAccompagnement,
      vocabulaire.modaliteAccompagnement.versCoop,
    ),
  }
}
