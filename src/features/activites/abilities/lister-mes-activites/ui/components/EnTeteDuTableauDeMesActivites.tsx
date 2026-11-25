import { EnTeteTriable } from '@/libraries/etat-d-url/liste'
import { listeDesActivites } from '../../../../ui/filtres/liste-des-activites.filtre'

export const EnTeteDuTableauDeMesActivites = ({
  adresse,
  parametres,
}: {
  adresse: string
  parametres: Readonly<Record<string, string>>
}) => (
  <thead>
    <tr>
      <th scope="col">Activité</th>
      <EnTeteTriable
        libelle="Date"
        lien={listeDesActivites.tri.lien(
          { chemin: adresse, parametres },
          listeDesActivites.charger(parametres),
          'date',
        )}
      />
      <th scope="col">Durée</th>
      <th scope="col">Lieu d’activité</th>
      <th scope="col">Enregistrée le</th>
      <th className="fr-sr-only">Détail de l’activité</th>
    </tr>
  </thead>
)
