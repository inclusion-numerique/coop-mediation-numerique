import { EnTeteTriable } from '@/libraries/etat-d-url/liste/EnTeteTriable'
import { colonnesDesUtilisateurs } from '../columns/utilisateurs.columns'
import type { LiensDeLaListe } from '../presenters/liste-des-utilisateurs.presenter'

export const UtilisateursTableHead = ({
  colonnes,
}: {
  colonnes: LiensDeLaListe['colonnes']
}) => (
  <thead>
    <tr>
      {colonnesDesUtilisateurs.map(({ cle, libelle, tri }) =>
        tri ? (
          <EnTeteTriable key={cle} libelle={libelle} lien={colonnes[tri]} />
        ) : (
          <th key={cle} scope="col">
            {libelle}
          </th>
        ),
      )}
      <th className="fr-sr-only">Fiche utilisateur</th>
    </tr>
  </thead>
)
