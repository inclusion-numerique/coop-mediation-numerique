export const jourLocal = (jour: Date): Date =>
  new Date(jour.getUTCFullYear(), jour.getUTCMonth(), jour.getUTCDate())

export const jourUtc = (jour: Date): Date =>
  new Date(Date.UTC(jour.getFullYear(), jour.getMonth(), jour.getDate()))
