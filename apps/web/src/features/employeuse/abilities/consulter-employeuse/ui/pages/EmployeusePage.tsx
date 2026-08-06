import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import type { EmployeuseConsulteeAffichage } from '../employeuse-consultee.presenter'

const LigneDefinition = ({
  label,
  valeur,
}: {
  label: string
  valeur: string | null
}) =>
  valeur ? (
    <div className="fr-mb-3v">
      <p className="fr-text--sm fr-text-mention--grey fr-mb-0">{label}</p>
      <p className="fr-text--md fr-mb-0">{valeur}</p>
    </div>
  ) : null

const EmployeusePage = ({
  employeuse,
}: {
  employeuse: EmployeuseConsulteeAffichage
}) => (
  <CoopPageContainer size="full">
    <SkipLinksPortal />
    <div className="fr-flex fr-flex-gap-lg-4v fr-direction-column fr-direction-lg-row fr-justify-content-space-between">
      <AdministrationBreadcrumbs
        parents={[
          {
            label: 'Structures employeuses',
            linkProps: { href: '/administration/structures-employeuses' },
          },
        ]}
        currentPage={employeuse.nom}
      />
    </div>

    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-building-line">
        {employeuse.nom}
      </AdministrationTitle>

      <div className="fr-grid-row fr-grid-row--gutters">
        <section className="fr-col-12 fr-col-lg-6">
          <h2 className="fr-h5">Identité légale</h2>
          <LigneDefinition label="Nom" valeur={employeuse.nom} />
          <LigneDefinition
            label="Dénomination"
            valeur={employeuse.denominationSirene}
          />
          <LigneDefinition label="SIRET" valeur={employeuse.siret} />
          <LigneDefinition label="RNA" valeur={employeuse.rna} />
          <LigneDefinition label="Adresse" valeur={employeuse.adresse} />
          <LigneDefinition label="Code INSEE" valeur={employeuse.codeInsee} />
        </section>

        {/* 7 325 employeuses sur 11 607 n'ont aucun contact : le titre seul, suivi
            de rien, valait mieux être tu. */}
        {employeuse.aUnReferent && (
          <section className="fr-col-12 fr-col-lg-6">
            <h2 className="fr-h5">Référent</h2>
            <LigneDefinition label="Nom" valeur={employeuse.nomReferent} />
            <LigneDefinition
              label="Courriel"
              valeur={employeuse.courrielReferent}
            />
            <LigneDefinition
              label="Téléphone"
              valeur={employeuse.telephoneReferent}
            />
          </section>
        )}
      </div>

      <section className="fr-mt-6v">
        <h2 className="fr-h5">
          Emplois ({employeuse.personnesEmployees.length})
        </h2>
        {employeuse.personnesEmployees.length === 0 ? (
          <p className="fr-text--sm fr-text-mention--grey">
            Aucun emploi rattaché à cette structure employeuse.
          </p>
        ) : (
          <ul className="fr-raw-list">
            {employeuse.personnesEmployees.map((personne) => (
              <li
                key={personne.id}
                className="fr-py-2v fr-border-bottom fr-flex fr-justify-content-space-between fr-align-items-center"
              >
                <span className="fr-text--md">{personne.libelle}</span>
                <span className="fr-text--xs fr-text-mention--grey">
                  {personne.courriel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  </CoopPageContainer>
)

export default EmployeusePage
