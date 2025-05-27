import { getAccompagnementsData } from './get-accompagnements-data'
import { getTotalAccompagnements } from './get-total-accompagnements'

export const getAccompagnements = async () => {
  const [accompagnements, accompagnementsData] = await Promise.all([
    getTotalAccompagnements(),
    getAccompagnementsData(),
  ])

  return {
    total: accompagnements.total,
    series: [
      {
        label: 'Par des médiateurs numériques',
        key: 'byMediateurs',
        ...accompagnements.byMediateurs,
      },
      {
        label: 'Par des conseillers numériques',
        key: 'byConseillers',
        ...accompagnements.byConseillers,
      },
    ],
    ...accompagnementsData,
  }
}
