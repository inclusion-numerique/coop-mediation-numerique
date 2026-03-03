# La Coop de la médiation numérique

[![Coverage Status](https://coveralls.io/repos/github/inclusion-numerique/coop-mediation-numerique/badge.svg?branch=main)](https://coveralls.io/github/inclusion-numerique/coop-mediation-numerique?branch=main)

<h2 id="à-propos">🪧 À propos</h2>

Bienvenue sur la Coop de la médiation numérique, développé par le [Pôle Inclusion numérique de l'ANCT](https://societenumerique.gouv.fr/fr/les-services-de-linclusion-numerique/). \
Ce [monorepo](https://en.wikipedia.org/wiki/Monorepo) fournit l'ensemble des projets nécessaires au fonctionnement d'une plateforme web utilisant le [Système de Design de l'Etat](https://www.systeme-de-design.gouv.fr/) et le [template commun de l'ANCT](https://www.figma.com/file/C9Ump1yh3z4DPMxm2qk3IY/Templates_communs?type=design&node-id=4-2946&t=d7Fn19OfHLoEcXqg-0) qui ajoute des composants métiers au Système de Design de l'État. \
L'objectif de ce projet est d’outiller les professionels de la médiation numérique.

## 📑 Table des matières

- 🪧 [À propos](#à-propos)
- ✨ [Fonctionnalités](#fonctionnalités)
- 🔗 [Environnements](#environnements)
- 📦 [Contenu](#contenu)
- 🤗 [Contribution](#contribution)
- 📝 [Licence](#licence)

<h2 id="fonctionnalités">✨ Fonctionnalités</h2>

- Accueil
- Connexion par lien magique
- Connexion avec Single Sign On
  - [ProConnect](https://github.com/numerique-gouv/proconnect-documentation/blob/main/doc_fs/README.md)
- Page profil
- Politique de confidentialité
- Mentions légales
- Conditions générales d'utilisation
- Statistiques
- Déclaration d'accessibilité
- Page d'erreur : 404, 500, etc.

<h2 id="environnements">🔗 Environnements</h2>

| Environnement | URL |
|---------------|-----|
| Production | https://coop-numerique.anct.gouv.fr |
| Dev | https://dev.coop-mediation-numerique.incubateur.anct.gouv.fr |
| MailDev (mails de test) | http://maildev.coop-numerique.anct.gouv.fr |

<h2 id="contenu">📦 Contenu</h2>

### Applications

Les `Applications` contiennent le code source des éléments propres au projet

- [cli](apps/cli) : Suite d'outils en ligne de commande qui servent à exécuter des scripts complexes nécessaires lors de processus automatisés tels que l'intégration et le déploiement automatisé.
- [web](apps/web) : Source du projet web next.js qui permet de faire tourner la stack, front et back en utilisant des servers components.

### Packages

Les `Packages` contiennent des outils de support et des communs dont l'origine provient de la [stack](https://github.com/inclusion-numerique/stack).

- [cdk](packages/cdk) : [Définition de l'infrastructure](packages/cdk/Readme.md) avec Terraform rédigé avec la version TypeScript du [CDKTF](https://developer.hashicorp.com/terraform/cdktf) pour déployer l'application sur [Scaleway](https://www.scaleway.com).
- [config](packages/config) : [Configuration des services](packages/config/Readme.md) utilisés lors de la génération, le déploiement et l'exécution via des variables d'environnement.
- [e2e](packages/e2e) : Tests de bout en bout opérés par [Cypress](https://www.cypress.io/).
- [emails](packages/emails) : Templates pour les emails utilisés par l'application.
- [fixtures](packages/fixtures) : Ensemble de données à insérer dans la base de données pour avoir un ensemble cohérent plutôt qu'un projet vide.
- [lint](packages/lint) : Configuration des règles de syntaxes à respecter dans le projet.
- [storybook](packages/storybook) : Configuration de storybook, utilisé pour administrer une bibliothèque des composants disponibles dans l'application.
- [test](packages/test) : Configuration de jest, utilisé pour les tests unitaires et les tests d'intégration.
- [ui](packages/ui) : Composants et utilitaires génériques provenant être réutilisés et surchargés dans d'autres applications.

<h2 id="contribution">🤗 Contribution</h2>

Pour contribuer, nous vous invitons à consulter le [guide de contribution](./CONTRIBUTING.md). Ce guide vous fournira des instructions détaillées sur la manière de configurer le projet localement, ainsi que sur la manière de soumettre des contributions de manière efficace.

<h2 id="licence">📝 Licence</h2>

Voir le fichier [LICENSE](./LICENSE) du dépôt.
