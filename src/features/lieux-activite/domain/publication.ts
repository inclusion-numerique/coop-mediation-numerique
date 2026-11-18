import { Service } from '@gouvfr-anct/lieux-de-mediation-numerique'
export const PUBLICATION_SANS_SERVICE =
  'Au moins un service doit être renseigné pour que le lieu d’activité soit visible sur la cartographie.'

export const PUBLICATION_SANS_ADRESSE =
  'Choisissez l’adresse du lieu d’activité dans la liste proposée pour pouvoir le rendre visible sur la cartographie.'

export const publicationSansService = (
  publie: boolean,
  services: readonly unknown[] | null | undefined,
): boolean => publie && (services?.length ?? 0) === 0

export const SERVICES_PAR_DEFAUT = [
  Service.MaitriseDesOutilsNumeriquesDuQuotidien,
  Service.ComprehensionDuMondeNumerique,
] as const

export const servicesALaPublication = (
  services: readonly Service[],
): readonly Service[] =>
  services.length === 0 ? SERVICES_PAR_DEFAUT : services
