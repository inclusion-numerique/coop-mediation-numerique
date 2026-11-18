/**
 * Neutralisation de `server-only` pour les exécutions hors Next.
 *
 * `server-only` est une garde de bundling : elle jette dès qu'un module marqué
 * est atteint par un graphe navigateur. Sa résolution passe par les conditions
 * de package — vide en `react-server`, levée d'erreur en `default`. Le CLI
 * (`tsx`, Node pur) tombe donc sur la seconde, alors qu'il EST un contexte
 * serveur et que la garde n'y a aucun sens.
 *
 * Le tsconfig l'alias ici pour ces exécutions-là. On vise `server-only` seul :
 * forcer la condition `react-server` globalement casserait `react-dom/server`,
 * dont dépendent les gabarits d'e-mails (`@faire/mjml-react`).
 */
export {}
