import { EnTeteTriable } from '@/libraries/etat-d-url/liste/EnTeteTriable'
import type { LiensDeLaListe } from '../filtres/liste-de-l-equipe.filtre'

export const EquipeTableHead = ({
  colonnes,
  avecActions,
}: {
  colonnes: LiensDeLaListe['colonnes']
  avecActions: boolean
}) => (
  <thead>
    <tr>
      <th scope="col" />
      <EnTeteTriable libelle="Membre" lien={colonnes.membre} />
      <th scope="col">Adresse email</th>
      <EnTeteTriable
        libelle="Structure employeuse"
        lien={colonnes.structureEmployeuse}
      />
      <EnTeteTriable libelle="Statut" lien={colonnes.statut} />
      {avecActions && <th scope="col" />}
      <th scope="col" className="fr-sr-only">
        Profil du membre
      </th>
    </tr>
  </thead>
)
