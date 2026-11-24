export const hrefDuBeneficiaire = (id: string) =>
  `/coop/mes-beneficiaires/${id}` as const

export const hrefDeModificationDuBeneficiaire = (id: string) =>
  `${hrefDuBeneficiaire(id)}/modifier` as const

export const hrefDesAccompagnements = (id: string) =>
  `${hrefDuBeneficiaire(id)}/accompagnements` as const

export const hrefDeLExportDesBeneficiaires = (requete: string) =>
  `/coop/mes-beneficiaires/export?${requete}` as const

export const hrefDeLAnalyseDeLImport = (id: string) =>
  `/coop/mes-beneficiaires/importer/analyse/${id}` as const

export const hrefDeLErreurDeLImport = (message: string) =>
  `/coop/mes-beneficiaires/importer/erreur?message=${encodeURIComponent(message)}` as const
