import {
  type Adresse,
  type Contact,
  type Courriel,
  type FormationLabel,
  type Frais,
  type Itinerance,
  type Localisation,
  ModaliteAcces,
  type ModaliteAccompagnement,
  type Nom,
  type Pivot,
  type Presentation,
  type PriseEnChargeSpecifique,
  type PublicSpecifiquementAdresse,
  type Service,
  type Typologie,
  type Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { BanId } from '../../../domain/ban-id'
import type { NomUsage } from '../../../domain/identite-sirene'
import type { Lieu } from '../../../domain/lieu'
import { ModifieParUtilisateur } from '../../../domain/tracabilite'
import type { UserId } from '../../../domain/user-id'
import type { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'

/**
 * La fiche d'un lieu se corrige section par section : chaque carte de la page
 * enregistre la sienne sans toucher aux autres. Une seule ability porte les
 * sept, parce qu'il n'y a qu'un écran et qu'elles partagent la même fiche.
 *
 * Le discriminant nomme la section éditée. Il rend inexprimable la mise à jour
 * partielle qui, dans le routeur tRPC, se faisait en réétalant toute la ligne
 * (`data: { ...structure, ...champsDeLaSection }`) : une écriture concurrente
 * sur une autre section était alors écrasée par une valeur relue avant elle.
 */
export type ModificationLieu =
  | {
      readonly section: 'InformationsGenerales'
      readonly nom: Nom
      readonly adresse: Adresse | null
      readonly localisation: Localisation | null
      readonly banId: BanId | null
      readonly itinerance: readonly Itinerance[]
      readonly typologies: readonly Typologie[]
      readonly pivot: Pivot | null
      readonly nomUsage: NomUsage | null
    }
  | {
      readonly section: 'VisibiliteCartographie'
      readonly visibilite: VisibiliteCartographie
    }
  | {
      readonly section: 'InformationsPratiques'
      readonly sitesWeb: readonly Url[]
      readonly ficheAccesLibre: Url | null
      readonly priseRdv: Url | null
      readonly horaires: string | null
    }
  | {
      readonly section: 'Description'
      readonly presentation: Presentation | null
      readonly formationsLabels: readonly FormationLabel[]
    }
  | {
      readonly section: 'ServicesEtAccompagnement'
      readonly services: readonly Service[]
      readonly modalitesAccompagnement: readonly ModaliteAccompagnement[]
    }
  | {
      readonly section: 'ModalitesAccesAuService'
      readonly modalitesAcces: readonly ModaliteAcces[]
      readonly telephone: string | null
      readonly courriels: readonly Courriel[]
      readonly fraisACharge: readonly Frais[]
    }
  | {
      readonly section: 'TypesDePublicsAccueillis'
      readonly publicsSpecifiquementAdresses: readonly PublicSpecifiquementAdresse[]
      readonly priseEnChargeSpecifique: readonly PriseEnChargeSpecifique[]
    }

export type SectionDeLaFiche = ModificationLieu['section']

/**
 * Le contact est réparti sur deux sections — les informations pratiques
 * possèdent les sites web, les modalités d'accès le téléphone et les courriels.
 * Éditer l'une ne doit rien retirer à l'autre, d'où ces recompositions plutôt
 * qu'un remplacement du `Contact` entier.
 */
const contactAvecSitesWeb = (
  contact: Contact,
  sitesWeb: readonly Url[],
): Contact => ({
  ...contact,
  ...(sitesWeb.length === 0
    ? { site_web: undefined }
    : { site_web: [...sitesWeb] }),
})

const contactAvecJoignabilite = (
  contact: Contact,
  telephone: string | null,
  courriels: readonly Courriel[],
): Contact => ({
  ...contact,
  telephone: telephone ?? undefined,
  ...(courriels.length === 0
    ? { courriels: undefined }
    : { courriels: [...courriels] }),
})

/**
 * Les seules modalités que le formulaire sait exprimer — se présenter,
 * téléphoner, écrire. Les trois autres du schéma national viennent des imports
 * cartographiques : dix lieux en portent une, et les réécrire depuis un
 * formulaire qui les ignore les effacerait. La section ne gouverne donc que les
 * siennes, et laisse les autres en place.
 */
const modalitesDuFormulaire: readonly ModaliteAcces[] = [
  ModaliteAcces.SePresenter,
  ModaliteAcces.Telephoner,
  ModaliteAcces.ContacterParMail,
]

const modalitesApres = (
  existantes: readonly ModaliteAcces[],
  saisies: readonly ModaliteAcces[],
): readonly ModaliteAcces[] => [
  ...saisies,
  ...existantes.filter((modalite) => !modalitesDuFormulaire.includes(modalite)),
]

const ficheApres = (
  lieu: Lieu,
  modification: ModificationLieu,
): Lieu['fiche'] => {
  // Un `default` ferait taire le contrôle d'exhaustivité de TypeScript, qui est
  // justement ce qui garantit qu'une section ajoutée sera traitée ici.
  // biome-ignore lint/style/useDefaultSwitchClause: l'union est exhaustive
  switch (modification.section) {
    case 'InformationsGenerales':
      return {
        ...lieu.fiche,
        nom: modification.nom,
        adresse: modification.adresse,
        localisation: modification.localisation,
        itinerance: modification.itinerance,
        typologies: modification.typologies,
        pivot: modification.pivot,
      }
    case 'VisibiliteCartographie':
      return lieu.fiche
    case 'InformationsPratiques':
      return {
        ...lieu.fiche,
        contact: contactAvecSitesWeb(lieu.fiche.contact, modification.sitesWeb),
        ficheAccesLibre: modification.ficheAccesLibre,
        priseRdv: modification.priseRdv,
        horaires: modification.horaires,
      }
    case 'Description':
      return {
        ...lieu.fiche,
        presentation: modification.presentation,
        formationsLabels: modification.formationsLabels,
      }
    case 'ServicesEtAccompagnement':
      return {
        ...lieu.fiche,
        services: modification.services,
        modalitesAccompagnement: modification.modalitesAccompagnement,
      }
    case 'ModalitesAccesAuService':
      return {
        ...lieu.fiche,
        contact: contactAvecJoignabilite(
          lieu.fiche.contact,
          modification.telephone,
          modification.courriels,
        ),
        modalitesAcces: modalitesApres(
          lieu.fiche.modalitesAcces,
          modification.modalitesAcces,
        ),
        fraisACharge: modification.fraisACharge,
      }
    case 'TypesDePublicsAccueillis':
      return {
        ...lieu.fiche,
        publicsSpecifiquementAdresses:
          modification.publicsSpecifiquementAdresses,
        priseEnChargeSpecifique: modification.priseEnChargeSpecifique,
      }
  }
}

/** L'enveloppe coop ne bouge que pour deux des sept sections. */
const enveloppeApres = (lieu: Lieu, modification: ModificationLieu) => ({
  visibilite:
    modification.section === 'VisibiliteCartographie'
      ? modification.visibilite
      : lieu.visibilite,
  banId:
    modification.section === 'InformationsGenerales'
      ? modification.banId
      : lieu.banId,
  identiteSirene:
    modification.section === 'InformationsGenerales'
      ? { ...lieu.identiteSirene, nomUsage: modification.nomUsage }
      : lieu.identiteSirene,
})

export const appliquerModification = (
  lieu: Lieu,
  modification: ModificationLieu,
  par: UserId,
  maintenant: Date,
): Lieu => ({
  ...lieu,
  fiche: ficheApres(lieu, modification),
  ...enveloppeApres(lieu, modification),
  tracabilite: {
    ...lieu.tracabilite,
    derniereModification: ModifieParUtilisateur(maintenant, par),
  },
})
