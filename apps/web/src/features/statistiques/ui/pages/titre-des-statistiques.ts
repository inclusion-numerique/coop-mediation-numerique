export const statistiquesPageTitle = (user: {
  coordinateur: { id: string } | null
  mediateur: { id: string } | null
}) =>
  user.coordinateur?.id && !user.mediateur?.id
    ? 'Statistiques'
    : 'Mes statistiques'
