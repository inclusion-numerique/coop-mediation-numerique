/**
 * Classe du bouton selon son état de chargement. La `className` est optionnelle :
 * l'interpoler directement collait un « undefined » littéral dans la liste de
 * classes pour tous les appels à un seul argument.
 */
export const buttonLoadingClassname = (
  isLoading: boolean,
  className?: string,
) => ({
  className: isLoading
    ? [className, 'fr-btn--loading'].filter(Boolean).join(' ')
    : className,
})
