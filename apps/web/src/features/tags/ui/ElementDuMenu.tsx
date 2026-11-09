'use client'

export const ElementDuMenu = ({
  icone,
  libelle,
  onClick,
}: {
  icone: string
  libelle: string
  onClick: () => void
}) => (
  <li>
    <button
      type="button"
      role="menuitem"
      className="fr-nav__link fr-display-block"
      onClick={onClick}
    >
      <span
        className={`${icone} fr-icon--sm fr-mr-1w fr-text-label--blue-france`}
        aria-hidden
      />
      {libelle}
    </button>
  </li>
)
