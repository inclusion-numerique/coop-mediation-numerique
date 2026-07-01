'use client'

import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import Input from '@codegouvfr/react-dsfr/Input'
import { useState } from 'react'
import ValiderFusionStructureAdministrative from './ValiderFusionStructureAdministrative'

const MergeStructureAdministrative = ({
  source,
}: {
  source: { id: string; nom: string }
}) => {
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState<{ id: string; nom: string } | null>(null)

  const search = trpc.structures.searchAdministrative.useQuery(
    { query },
    { enabled: query.trim().length >= 2 },
  )

  const results = (search.data?.structures ?? []).filter(
    (structure) => structure.id !== source.id,
  )

  return (
    <div className="fr-flex fr-direction-column fr-flex-gap-4v">
      <p className="fr-mb-0">
        Employeuse à fusionner (source, sera supprimée)&nbsp;:{' '}
        <strong>{source.nom}</strong>
      </p>

      {target ? (
        <div className="fr-p-4v fr-background-alt--blue-france fr-border-radius--8 fr-flex fr-direction-column fr-flex-gap-2v">
          <p className="fr-mb-0">
            Cible (conservée)&nbsp;: <strong>{target.nom}</strong>
          </p>
          <div className="fr-flex fr-flex-gap-2v">
            <ValiderFusionStructureAdministrative
              sourceStructure={source}
              targetStructure={target}
            />
            <Button priority="secondary" onClick={() => setTarget(null)}>
              Changer de cible
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Input
            label="Rechercher l'employeuse cible (nom, SIRET, adresse, commune)"
            nativeInputProps={{
              value: query,
              onChange: (event) => setQuery(event.target.value),
              placeholder: 'Au moins 2 caractères',
            }}
          />
          {query.trim().length >= 2 && results.length === 0 ? (
            <p className="fr-text--sm fr-text-mention--grey">
              {search.isFetching ? 'Recherche…' : 'Aucune employeuse trouvée.'}
            </p>
          ) : null}
          <ul className="fr-raw-list fr-flex fr-direction-column fr-flex-gap-1v">
            {results.map((structure) => (
              <li key={structure.id}>
                <Button
                  priority="tertiary"
                  size="small"
                  onClick={() =>
                    setTarget({ id: structure.id, nom: structure.nom })
                  }
                >
                  {structure.nom}
                  {structure.siret ? ` — ${structure.siret}` : ' — sans SIRET'}
                  {structure.commune ? ` — ${structure.commune}` : ''}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default withTrpc(MergeStructureAdministrative)
