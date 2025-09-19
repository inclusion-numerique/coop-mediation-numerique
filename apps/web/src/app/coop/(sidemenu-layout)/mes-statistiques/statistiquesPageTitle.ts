export const statistiquesPageTitle = (user: {
  coordinateur: { id: string } | null
  mediateur: { id: string } | null
}) => {
  return user.coordinateur?.id && !user.mediateur?.id
    ? 'Statistiques' // Coordinateur only see page as "Statistiques"
    : 'Mes statistiques' // Mediateur and coordinateur with mediation activity see page as "Mes statistiques"
}
