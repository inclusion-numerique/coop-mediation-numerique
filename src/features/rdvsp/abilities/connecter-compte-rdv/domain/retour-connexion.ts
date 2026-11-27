import type { EchecDeConnecterCompteRdv } from './errors'

export type DestinationsDeRetour = {
  readonly redirectToSuccess?: string | undefined
  readonly redirectToError?: string | undefined
}

export type IssuesDuRetour = {
  readonly succes: string
  readonly echec: string
}

const DESTINATION_PAR_DEFAUT = '/coop'

export const issuesDuRetour = (
  destinations: DestinationsDeRetour,
): IssuesDuRetour => ({
  succes: destinations.redirectToSuccess ?? DESTINATION_PAR_DEFAUT,
  echec: destinations.redirectToError ?? DESTINATION_PAR_DEFAUT,
})

export const motifDiagnostic = (erreur: EchecDeConnecterCompteRdv): string =>
  erreur._tag === 'CodeAutorisationRefuse'
    ? `${erreur._tag} (${erreur.detail})`
    : erreur._tag

export const cheminDeRedirection = (
  chemin: string,
  motif?: Readonly<Record<string, string>>,
): string =>
  motif === undefined
    ? chemin
    : `${chemin}?${new URLSearchParams({ ...motif }).toString()}`
