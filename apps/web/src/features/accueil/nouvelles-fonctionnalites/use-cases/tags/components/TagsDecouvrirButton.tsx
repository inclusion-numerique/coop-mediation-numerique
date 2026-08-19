'use client'

import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'

const TagsDecouvrirModalInstance = createModal({
  id: 'tags-decouvrir',
  isOpenedByDefault: false,
})

const TagsDecouvrirButton = () => {
  return (
    <>
      <Button
        type="button"
        priority="secondary"
        size="small"
        {...TagsDecouvrirModalInstance.buttonProps}
      >
        Découvrir
      </Button>
      <TagsDecouvrirModalInstance.Component title="" className="twoPanesModal">
        <div className="fr-flex fr-direction-column fr-direction-xl-row">
          <div className="fr-flex fr-flex-1 fr-direction-column fr-justify-content-space-between fr-p-12v">
            <div>
              <Badge
                small
                className="fr-badge--new fr-mb-0 fr-py-1v fr-text--uppercase"
              >
                <span
                  className="ri-price-tag-3-line ri-lg fr-mr-1w"
                  aria-hidden
                />
                Nouveauté : les tags{' '}
              </Badge>
              <h4 className="fr-mt-8v fr-mb-4v">
                Suivez des thématiques spécifiques, dispositifs locaux&hellip;
                <br />
                grâce aux tags&nbsp;!
              </h4>
              <p className="fr-mb-8v">
                Créez vos tags personnalisés, utilisez des tags proposés par
                votre coordinateur à l’échelle départementale, ainsi que des
                tags nationaux.{' '}
              </p>
              <p className="fr-text--bold fr-text--uppercase fr-text--xs fr-mb-2v">
                Comment ça marche&nbsp;?
              </p>
              <ol className="fr-text--sm">
                <li className="">
                  Ajoutez des tags à vos comptes rendus d’activités
                </li>
                <li className="">
                  Filtrez vos statistiques et vos activités par tags pour suivre
                  les thématiques, dispositifs que vous souhaitez.
                </li>
                <li className="">
                  Gérez vos tags personnels via une page dédiée
                </li>
              </ol>
            </div>

            <div className="fr-mt-12v">
              <Button
                linkProps={{
                  href: 'https://www.notion.so/incubateurdesterritoires/Les-Tags-20d744bf03dd80e2bc35d42a50ae3e69',
                  target: '_blank',
                }}
              >
                En savoir plus
              </Button>
              <Button
                type="button"
                priority="tertiary no outline"
                className="fr-ml-4v"
                onClick={() => TagsDecouvrirModalInstance.close()}
              >
                J’ai compris
              </Button>
            </div>
          </div>
          <div className="fr-p-14v fr-background-contrast--blue-france fr-flex fr-index-n1">
            <img
              src="/images/fonctionnalites/tags-illustration.svg"
              alt=""
              className="fr-m-auto fr-width-full"
            />
          </div>
        </div>
      </TagsDecouvrirModalInstance.Component>
    </>
  )
}

export default TagsDecouvrirButton
