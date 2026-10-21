import AdministrationInfoCard from '@app/web/libs/ui/administration/AdministrationInfoCard'
import AdministrationInlineLabelsValues, {
  type LabelAndValue,
} from '@app/web/libs/ui/administration/AdministrationInlineLabelsValues'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import Accordion from '@codegouvfr/react-dsfr/Accordion'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
import type { EmployeuseHistoriqueAffichage } from './historique-employeuses.presenter'

const informationsDeLaStructure = ({
  structure,
}: EmployeuseHistoriqueAffichage): LabelAndValue[] => [
  { label: 'Nom', value: structure.nom },
  {
    label: 'Id',
    value: (
      <Link
        href={`/administration/structures-employeuses/${structure.id}`}
        target="_blank"
        rel="noreferrer"
      >
        {structure.id}
      </Link>
    ),
  },
  { label: 'Adresse', value: structure.adresse || 'Non renseignée' },
  { label: 'Siret', value: structure.siret || 'Non renseigné' },
  { label: 'Rna', value: structure.rna || 'Non renseigné' },
  { label: 'Commune', value: structure.commune || 'Non renseignée' },
  { label: 'Code Insee', value: structure.codeInsee || 'Non renseigné' },
  { label: 'Code postal', value: structure.codePostal || 'Non renseigné' },
  {
    label: 'Créé le',
    value: structure.creation ? dateAsDay(structure.creation) : '-',
  },
  {
    label: 'Structure supprimée le',
    value: structure.suppression ? dateAsDay(structure.suppression) : '-',
  },
]

const Emploi = ({
  emploi,
  termine,
}: {
  emploi: EmployeuseHistoriqueAffichage
  termine: boolean
}) => (
  <div>
    <hr className="fr-separator-1px fr-mt-4v" />
    <div className="fr-text--lg fr-text--medium fr-mb-4v fr-mt-8v">
      {emploi.structure.nom}{' '}
      {termine ? (
        <Badge className="fr-ml-2w" severity="warning" small>
          Contrat terminé
        </Badge>
      ) : (
        <Badge className="fr-ml-2w" severity="success" small>
          Contrat en cours
        </Badge>
      )}
    </div>
    <AdministrationInlineLabelsValues
      className="fr-mt-4v"
      items={[
        {
          label: 'Début du contrat',
          value: emploi.debut ? dateAsDay(emploi.debut) : '-',
        },
        {
          label: 'Fin du contrat',
          value: emploi.fin ? dateAsDay(emploi.fin) : '-',
        },
        {
          label: 'Créé le',
          value: emploi.creation ? dateAsDay(emploi.creation) : '-',
        },
      ]}
    />
    <p className="fr-mb-0 fr-mt-6v">Informations sur la structure&nbsp;:</p>
    <AdministrationInlineLabelsValues
      className="fr-mt-4v"
      items={informationsDeLaStructure(emploi)}
    />
  </div>
)

export const HistoriqueDesEmployeuses = ({
  emplois,
}: {
  emplois: readonly EmployeuseHistoriqueAffichage[]
}) => {
  if (emplois.length === 0)
    return (
      <AdministrationInfoCard title="Structure employeuse">
        <Notice
          className="fr-notice--alert fr-mt-4v fr-mb-0"
          title={<>Aucune structure employeuse</>}
        />
      </AdministrationInfoCard>
    )

  const enCours = emplois.filter(({ estActive }) => estActive)
  const termines = emplois.filter(({ estActive }) => !estActive)

  return (
    <AdministrationInfoCard title="Contrats - Structures employeuses">
      {enCours.length > 0 ? (
        enCours.map((emploi) => (
          <Emploi key={emploi.id} emploi={emploi} termine={emploi.termine} />
        ))
      ) : (
        <Notice
          className="fr-notice--info fr-mt-4v fr-mb-0"
          title={<>Aucun contrat en cours</>}
        />
      )}
      {termines.length > 0 && (
        <div className="fr-accordions-group fr-mt-8v">
          <Accordion label={`Terminés - ${termines.length}`}>
            {termines.map((emploi) => (
              <Emploi key={emploi.id} emploi={emploi} termine />
            ))}
          </Accordion>
        </div>
      )}
    </AdministrationInfoCard>
  )
}
