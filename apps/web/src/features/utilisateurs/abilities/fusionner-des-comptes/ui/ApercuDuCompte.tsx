import { MergeDiff } from '@app/web/libs/ui/administration/MergeDiff'
import {
  type CategorieDeFusion,
  type CompteApercu,
  type ContenuDuCompte,
  categoriesDeFusion,
} from '../domain'

const libelles: Record<CategorieDeFusion, string> = {
  beneficiaires: 'Bénéficiaires',
  activites: 'Activités',
  structuresEmployeuses: 'Structures employeuses',
  lieuxActivite: 'Lieux d’activité',
  equipesRejointes: 'Membre équipes',
  mediateursCoordonnes: 'Équipe coordonnée',
  invitationsRecues: 'Invitations reçues',
  invitationsEnvoyees: 'Invitations envoyées',
  mutations: 'Mutations',
  tags: 'Tags',
}

export const ApercuDuCompte = ({
  compte,
  communs,
  source,
}: {
  compte: CompteApercu
  communs: ContenuDuCompte
  source: ContenuDuCompte | null
}) => (
  <>
    <h2 className="fr-h6 fr-flex fr-flex-gap-2v">
      <span
        className={source === null ? 'ri-user-unfollow-line' : 'ri-group-line'}
        aria-hidden
      />
      <span className="fr-flex fr-direction-column">
        {compte.nom}
        <span className="fr-text-mention--grey fr-text--sm fr-mb-0">
          {compte.courriel}
        </span>
      </span>
    </h2>
    <ul>
      {categoriesDeFusion.map((categorie) => (
        <li key={categorie}>
          {libelles[categorie]}&nbsp;: {compte.contenu[categorie].length}
          <MergeDiff
            isAddition={source !== null}
            sourceIds={(source ?? compte.contenu)[categorie]}
            commonIds={communs[categorie]}
          />
        </li>
      ))}
    </ul>
  </>
)
