import {
  type Contact,
  type Courriel,
  ModaliteAcces,
  type Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

/**
 * Le contact est réparti sur deux sections — les informations pratiques
 * possèdent les sites web, les modalités d'accès le téléphone et les courriels.
 * Éditer l'une ne doit rien retirer à l'autre, d'où ces recompositions plutôt
 * qu'un remplacement du `Contact` entier.
 */
export const contactAvecSitesWeb = (
  contact: Contact,
  sitesWeb: readonly Url[],
): Contact => ({
  ...contact,
  ...(sitesWeb.length === 0
    ? { site_web: undefined }
    : { site_web: [...sitesWeb] }),
})

export const contactAvecJoignabilite = (
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

export const modalitesApres = (
  existantes: readonly ModaliteAcces[],
  saisies: readonly ModaliteAcces[],
): readonly ModaliteAcces[] => [
  ...saisies,
  ...existantes.filter((modalite) => !modalitesDuFormulaire.includes(modalite)),
]
