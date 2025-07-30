'use client'

import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import styles from './TagsDecouvrirModal.module.css'

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
      <TagsDecouvrirModalInstance.Component
        title=""
        className={styles.twoPanesModal}
      >
        <div className={styles.panes}>
          <div className={styles.contentPane}>
            <div>
              <Badge className="fr-badge--new fr-mb-0 fr-py-1v">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.26979 1.40015L13.8695 2.34295L14.8123 8.94265L8.68399 15.0708C8.42366 15.3312 8.00159 15.3312 7.74119 15.0708L1.14155 8.47125C0.881201 8.21085 0.881201 7.78878 1.14155 7.52838L7.26979 1.40015ZM7.74119 2.81436L2.55577 7.99978L8.21259 13.6566L13.3981 8.47125L12.691 3.52147L7.74119 2.81436ZM9.15546 7.05698C8.63473 6.5363 8.63473 5.69208 9.15546 5.17138C9.67613 4.65069 10.5203 4.65069 11.0411 5.17138C11.5617 5.69208 11.5617 6.5363 11.0411 7.05698C10.5203 7.57771 9.67613 7.57771 9.15546 7.05698Z"
                    fill="#716043"
                  />
                </svg>
                <span className="fr-ml-2v">Nouveauté : les tags</span>
              </Badge>
              <h4 className="fr-mt-8v fr-mb-4v">
                Suivez des thématiques spécifiques, dispositifs locaux&hellip;
                <br />
                grâce aux tags&nbsp;!
              </h4>
              <p className="fr-mb-8v">
                Créez vos tags personnalisés, utilisez des tags proposés par
                votre coordinateur à l’échelle départemental, ainsi que des tags
                nationaux.{' '}
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
          <div className={styles.illustrationPane}>
            <img
              src="/images/fonctionnalites/tags-illustration.svg"
              style={{ width: '100%' }}
              alt=""
              className="fr-mt-8v fr-mb-12v"
            />
          </div>
        </div>
      </TagsDecouvrirModalInstance.Component>
    </>
  )
}

export default TagsDecouvrirButton
