# La Coop de la médiation numérique

[![Couverture](https://inclusion-numerique.github.io/coop-mediation-numerique/annexes/couverture/badge.svg)](https://inclusion-numerique.github.io/coop-mediation-numerique/annexes/couverture/index.html)

<h2 id="a-propos">🪧 À propos</h2>

La Coop de la médiation numérique est l'outil de travail quotidien des médiateurs et médiatrices numériques, des conseillers numériques et de leurs coordinateurs. Elle est développée par le [Programme Société Numérique](https://societenumerique.gouv.fr) de l'Agence nationale de la cohésion des territoires (ANCT), avec le [Système de Design de l'État](https://www.systeme-de-design.gouv.fr/).

Elle permet de :

- enregistrer ses accompagnements, individuels ou collectifs, et ses activités de coordination ;
- suivre ses bénéficiaires, les importer depuis un tableur et repérer les doublons ;
- consulter ses statistiques d'activité et les exporter ;
- gérer son équipe quand on coordonne d'autres médiateurs ;
- décrire ses lieux d'activité, publiés sur la [Cartographie nationale des lieux d'inclusion numérique](https://cartographie.societenumerique.gouv.fr) ;
- retrouver les acteurs de la médiation numérique de son territoire ;
- relier son compte à [RDV Service Public](https://rdv.anct.gouv.fr) pour voir ses rendez-vous parmi ses activités ;
- accéder aux outils numériques utiles à la médiation.

La connexion passe par [ProConnect](https://www.proconnect.gouv.fr). Une [API](https://coop-numerique.anct.gouv.fr/api/v1/documentation) ouvre les données d'activité aux partenaires habilités.

## 📑 Table des matières

- 🪧 [À propos](#a-propos)
- 🔗 [Environnements](#environnements)
- 🧭 [Liens utiles](#liens-utiles)
- 📚 [Documentation](#documentation)
- 📦 [Contenu du dépôt](#contenu)
- 🤗 [Contribuer](#contribuer)
- 📝 [Licence](#licence)

<h2 id="environnements">🔗 Environnements</h2>

| Environnement | URL                                                          |
| ------------- | ------------------------------------------------------------ |
| Production    | https://coop-numerique.anct.gouv.fr                          |
| Dev           | https://dev.coop-mediation-numerique.incubateur.anct.gouv.fr |
| MailDev       | http://maildev.coop-numerique.anct.gouv.fr                   |

Chaque pull request peut aussi déployer son propre environnement de preview, voir le [guide de contribution](./CONTRIBUTING.md#ci-cd). Les e-mails de `dev` et des previews ne partent pas : ils arrivent dans MailDev.

<h2 id="liens-utiles">🧭 Liens utiles</h2>

- [Centre d'aide](https://docs.numerique.gouv.fr/docs/1cf724be-c40c-4299-906d-df22c181c77b/) : la documentation destinée aux utilisateurs
- [Statistiques d'impact](https://coop-numerique.anct.gouv.fr/statistiques) : l'usage de la plateforme, publié en continu
- [Documentation de l'API v1](https://coop-numerique.anct.gouv.fr/api/v1/documentation)
- [Tickets](https://github.com/anct-cnum/suite-gestionnaire-numerique/issues) : le suivi des demandes et des anomalies, partagé avec la suite gestionnaire numérique

<h2 id="documentation">📚 Documentation</h2>

- [Documentation technique](https://inclusion-numerique.github.io/coop-mediation-numerique/) : les décisions d'architecture, les spécifications exécutables, les graphes et les tables d'imports, et les rapports, publiés à chaque fusion sur `main`
- [Guide de contribution](./CONTRIBUTING.md) : installer l'environnement de développement et les pratiques du dépôt
- [Infrastructure](./infrastructure/README.md) : les ressources Scaleway de chaque environnement, les tâches planifiées et le déploiement
- [AGENTS.md](./AGENTS.md) : les conventions de code, rédigées pour les agents de code et utiles à tout le monde

<h2 id="contenu">📦 Contenu du dépôt</h2>

- [src](src) : l'application Next.js, interface et serveur, avec ses fonctionnalités, ses bibliothèques partagées et les outils en ligne de commande du déploiement, des secrets et des tâches (`src/cli`)
- [prisma](prisma) : les schémas de la base et leurs migrations
- [e2e](e2e) : les tests de bout en bout et de composants
- [.storybook](.storybook) : la configuration de Storybook
- [infrastructure](infrastructure) : l'infrastructure de chaque environnement, en HCL pour [OpenTofu](https://opentofu.org)
- [docker](docker) : les images de l'application et de PostgreSQL
- [public](public) et [private-static](private-static) : les fichiers statiques servis aux navigateurs, et les données que le serveur lit sans les servir
- [scripts](scripts) : les scripts de build et de génération appelés par le `package.json`
- [docs](docs) : les décisions d'architecture et les procédures
- [.github](.github) : l'intégration et le déploiement continus, et Dependabot

<h2 id="contribuer">🤗 Contribuer</h2>

Le [guide de contribution](./CONTRIBUTING.md) explique comment installer le projet, le lancer, le tester et proposer une modification.

<h2 id="licence">📝 Licence</h2>

Ce projet est un logiciel libre, distribué sous licence [AGPL-3.0-or-later](./LICENSE) : vous pouvez le redistribuer et le modifier selon les termes de la GNU Affero General Public License publiée par la Free Software Foundation, soit la version 3 de la licence, soit, à votre choix, toute version ultérieure.
