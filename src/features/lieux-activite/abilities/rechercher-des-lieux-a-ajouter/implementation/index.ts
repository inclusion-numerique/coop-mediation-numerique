import { rechercherDesLieuxAAjouter as rechercher } from '../domain/rechercher'
import { chercherDansLAnnuaireDesEntreprises } from './api-entreprise/annuaire-des-entreprises'
import { chercherDansLaCartographie } from './entrepot/lieux-de-la-cartographie.query'
import { chercherDansLaCoop } from './prisma/lieux-de-la-coop.query'

export { chercherDansLaCoop }

export const rechercherDesLieuxAAjouter = rechercher({
  chercherDansLaCoop,
  chercherDansLaCartographie,
  chercherDansLAnnuaireDesEntreprises,
})
