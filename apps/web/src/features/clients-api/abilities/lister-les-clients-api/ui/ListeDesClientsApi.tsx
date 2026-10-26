import type { ClientApi } from '@app/web/features/clients-api/domain'
import Link from 'next/link'
import { ligneDeClientApi } from './clients-api.presenter'

export const ListeDesClientsApi = ({
  clients,
}: {
  clients: readonly ClientApi[]
}) => (
  <div className="fr-table fr-mb-8v" data-fr-js-table="true">
    <div className="fr-table__wrapper">
      <div className="fr-table__container">
        <div className="fr-table__content">
          <table data-fr-js-table-element="true">
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col">Client ID</th>
                <th scope="col">Permissions</th>
                <th scope="col">Début de validité</th>
                <th scope="col">Fin de validité</th>
                <th scope="col">Créé le</th>
                <th scope="col">Mis à jour le</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(ligneDeClientApi).map((ligne) => (
                <tr key={ligne.id}>
                  <td>
                    <Link href={ligne.href}>{ligne.nom}</Link>
                  </td>
                  <td>{ligne.id}</td>
                  <td>{ligne.permissions}</td>
                  <td>{ligne.debut}</td>
                  <td>{ligne.fin}</td>
                  <td>{ligne.creeLe}</td>
                  <td>{ligne.modifieLe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)
