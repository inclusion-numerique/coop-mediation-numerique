import Link from 'next/link'
import type { LigneUtilisateur } from '@/features/utilisateurs/domain'
import { colonnesDesUtilisateurs } from './utilisateurs.columns'

export const UtilisateurTableRow = ({
  utilisateur,
}: {
  utilisateur: LigneUtilisateur
}) => (
  <tr className="fr-enlarge-link fr-table-row--link">
    {colonnesDesUtilisateurs.map(({ cle, cellule }) => (
      <td key={cle} className="fr-cell--data">
        {cellule(utilisateur)}
      </td>
    ))}
    <td className="fr-p-0">
      <Link href={`/administration/utilisateurs/${utilisateur.id}`}>
        <span className="fr-sr-only">
          Voir la fiche de {utilisateur.nomAffiche}
        </span>
      </Link>
    </td>
  </tr>
)
