import { EnTeteTriable } from '@/libraries/etat-d-url/liste'
import type { LiensDeLaListe } from '../filtres/liste-des-lieux.filtre'

export const LieuxTableHead = ({
  colonnes,
}: {
  colonnes: LiensDeLaListe['colonnes']
}) => (
  <thead>
    <tr>
      <EnTeteTriable libelle="Nom" lien={colonnes.nom} />
      <th scope="col">Type</th>
      <th scope="col">Adresse</th>
      <th scope="col">SIRET</th>
      <th scope="col">Typologies</th>
      <th scope="col">Visible carto</th>
      <EnTeteTriable libelle="Création" lien={colonnes.creation} />
      <EnTeteTriable libelle="Modification" lien={colonnes.modification} />
      <EnTeteTriable
        libelle="Médiateurs en activité"
        lien={colonnes.mediateursEnActivite}
      />
      <th className="fr-sr-only">Modifier le lieu</th>
    </tr>
  </thead>
)
