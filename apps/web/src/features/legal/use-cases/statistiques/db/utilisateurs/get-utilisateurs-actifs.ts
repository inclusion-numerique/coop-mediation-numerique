import { getUtilisateursActifsData } from '@app/web/features/legal/use-cases/statistiques/db/utilisateurs/get-utilisateurs-actifs-data'
import { getTotalUtilisateursActifs } from './get-total-utilisateurs-actifs'

export const getUtilisateursActifs = async () => {
  const { total, mediateurs, conseillers, coordinateurs } =
    await getTotalUtilisateursActifs()

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
    ...(await getUtilisateursActifsData()),
  }
}
