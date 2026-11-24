export const hrefDeLExportDesAccompagnements = (publicExportId?: string) =>
  publicExportId
    ? (`/coop/mes-activites/export/${publicExportId}` as const)
    : '/coop/mes-activites/export'

export const hrefDeLExportDesStatistiques = (publicExportId?: string) =>
  publicExportId
    ? (`/coop/mes-statistiques/export/${publicExportId}` as const)
    : '/coop/mes-statistiques/export'
