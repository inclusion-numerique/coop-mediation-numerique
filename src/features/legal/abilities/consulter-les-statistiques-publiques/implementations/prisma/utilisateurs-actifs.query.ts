import type { MesureDesUtilisateursActifs } from '../../domain/ports'

export const lireLesUtilisateursActifs = async ({
  mesurerLesUtilisateursActifs,
  utilisateursActifsParMois,
}: MesureDesUtilisateursActifs) => {
  const [{ total, mediateurs, conseillers, coordinateurs }, perMonth] =
    await Promise.all([
      mesurerLesUtilisateursActifs(new Date()),
      utilisateursActifsParMois(),
    ])

  return {
    total,
    series: [
      {
        label: 'Médiateurs numériques actifs',
        description: `sur ${mediateurs.total} profils de médiateurs numériques créés`,
        key: 'mediateursActifs',
        ...mediateurs,
      },
      {
        label: 'Conseillers numériques actifs',
        description: `sur ${conseillers.total} profils de conseillers numériques créés`,
        key: 'conseillersActifs',
        ...conseillers,
      },
      {
        label: 'Coordinateurs actifs',
        description: `sur ${coordinateurs.total} profils de coordinateurs créés`,
        key: 'coordinateursActifs',
        ...coordinateurs,
      },
    ],
    perMonth,
  }
}
