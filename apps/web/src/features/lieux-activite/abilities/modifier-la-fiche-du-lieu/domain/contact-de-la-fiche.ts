import {
  type Contact,
  type Courriel,
  ModaliteAcces,
  type Telephone,
  type Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

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
  telephone: Telephone | null,
  courriels: readonly Courriel[],
): Contact => ({
  ...contact,
  telephone: telephone ?? undefined,
  ...(courriels.length === 0
    ? { courriels: undefined }
    : { courriels: [...courriels] }),
})

const modalitesDuFormulaire: readonly ModaliteAcces[] = [
  ModaliteAcces.SePresenter,
  ModaliteAcces.Telephoner,
  ModaliteAcces.ContacterParMail,
]

export const modalitesApres = (
  existantes: readonly ModaliteAcces[],
  saisies: readonly ModaliteAcces[],
): ModaliteAcces[] => [
  ...saisies,
  ...existantes.filter((modalite) => !modalitesDuFormulaire.includes(modalite)),
]
