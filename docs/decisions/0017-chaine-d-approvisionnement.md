# ADR-017 : Chaîne d'approvisionnement des dépendances

## Auteurs et historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |

## Statut

Accepté

## Contexte

Plusieurs constats s'additionnaient :

- L'application dépend de plusieurs milliers de paquets npm, directs et transitifs.
- Les attaques de la chaîne d'approvisionnement npm se multiplient : comptes de mainteneurs
  compromis, vers qui publient des versions piégées. Le code malveillant s'exécute souvent dans un
  script d'installation, sur le poste de développement comme en CI. Ces versions piégées sont en
  général repérées et retirées en quelques heures ou quelques jours.
- D'autres portes d'entrée existent : un script chargé depuis un CDN sans version fixée, une
  montée de dépendance fusionnée sans relecture, un secret commité par erreur.

## Décision

Aucun code tiers n'entre dans le dépôt, sur les postes, en CI ou dans le navigateur sans être
passé par un délai de quarantaine, un lockfile et une décision explicite. Les secrets sont
arrêtés avant le commit.

### Une quarantaine de 15 jours avant toute installation

pnpm refuse d'installer une version de paquet publiée depuis moins de 15 jours. Une version
piégée a le temps d'être repérée et retirée avant d'atteindre le dépôt.

On n'abaisse jamais ce délai. Un paquet qui doit y échapper est ajouté nommément à la liste
d'exclusions. Trois cas justifient une exclusion :

- une bibliothèque de l'ANCT publiée depuis sa CI, avec attestation de provenance ;
- un paquet dont il faut une version récente, avec les paquets natifs par plateforme qu'il publie
  en même temps et sans lesquels l'installation échoue : ils sont exclus ensemble ;
- un correctif de sécurité d'une bibliothèque, qu'on fait passer avant la fin de la quarantaine.
  L'exclusion porte alors sur la version exacte corrigée, pas sur le paquet entier. pnpm accepte
  dans la liste une version exacte, ou plusieurs versions exactes séparées par « || », mais refuse
  les plages de versions : les versions d'un même paquet sont réunies dans une seule entrée.

Une exclusion qui n'a plus de raison d'être est levée.

### Les scripts d'installation refusés par défaut

pnpm n'exécute aucun script d'installation sans décision explicite. Une liste autorise ou refuse
chaque paquet qui en demande un ; un paquet absent de la liste fait échouer l'installation.

Une autorisation ne s'ajoute qu'avec une raison de compilation native avérée. Un script inutile
est refusé.

### Les vulnérabilités transitives corrigées par une surcharge

Quand une dépendance transitive vulnérable ne se met pas à jour d'elle-même, une règle de
surcharge force la version corrigée, bornée à la plage de versions concernée.

### Dependabot détecte, Renovate est la cible

Dependabot ouvre chaque semaine des PR de mise à jour, avec le même délai d'attente de 15 jours.
Ses alertes de sécurité signalent les failles connues.

Ses PR ne sont pas fusionnées : chaque montée passe par une PR créée à la main, qui passe toute la
CI. Dependabot ferme sa PR quand la dépendance est montée sur la branche principale ; ses
workflows n'ont donc besoin d'aucun secret.

Le check de revue des dépendances ne bloque que les failles critiques : la quarantaine rend
souvent un correctif récent inatteignable pendant 15 jours. Le suivi complet reste aux alertes.

GitHub documente un risque : un lockfile pnpm écrit en deux documents YAML, format par défaut
quand la version de pnpm est épinglée, peut priver Dependabot de la vision des dépendances, donc
des alertes de sécurité. Les alertes fonctionnent aujourd'hui sur ce dépôt ; c'est à surveiller.

Cible à atteindre, ticket à ouvrir : passer à Renovate. Il apporterait l'épinglage automatique
des actions GitHub par empreinte, avec la version en annotation, un tableau de bord des
dépendances et une configuration unique. Ses mises à jour de sécurité contournent la quarantaine
de façon documentée. Son coût : une application tierce avec un accès en écriture au dépôt.

### Aucun script chargé depuis un CDN

Tout le code exécuté par le navigateur vient de dépendances npm empaquetées par Next. Il passe
donc par la quarantaine et le lockfile.

La documentation de l'API utilise le composant React du visualiseur, qui remplace un chargement
depuis un CDN sans version fixée. Les polices et l'agent externe du visualiseur sont désactivés,
et le CDN sort de la politique de sécurité du contenu. Les icônes viennent de react-dsfr
([ADR-010](./0010-styles-dsfr.md)).

### gitleaks au pré-commit

Le hook de pré-commit lance gitleaks sur les changements indexés. Il refuse le commit si gitleaks
n'est pas installé.

### Les actions GitHub épinglées par empreinte

Les workflows référencent aujourd'hui les actions tierces par un nom de version, l'étiquette
majeure. Qui contrôle le dépôt d'une action peut déplacer cette étiquette vers un autre code. La
parade est de référencer chaque action par l'empreinte exacte de sa version.

Cible à atteindre, ticket à ouvrir : épingler les actions par empreinte, de façon automatique
avec Renovate.

## Alternatives écartées

### Abaisser la quarantaine ponctuellement

Une option de ligne de commande peut abaisser le délai pour une installation. Elle ouvre tout le
lockfile aux versions récentes, pas seulement le paquet visé. L'exclusion nommée garde la
protection pour tout le reste.

### Autoriser les scripts d'installation par défaut

C'est le comportement historique de npm, et le vecteur des vers. Une liste explicite coûte une
ligne par paquet natif.

### Fusionner les PR de Dependabot

Il faudrait donner à ses workflows les secrets de la CI et accepter son découpage des montées. Une
PR créée à la main garde la maîtrise du découpage et de la relecture.

### Garder le CDN en fixant la version et une empreinte d'intégrité

Cela protège d'une modification du fichier, pas d'une version piégée choisie au moment de la
fixer. Le script échappe toujours à la quarantaine et au lockfile.

## Conséquences

**Positives**

- Une version piégée retirée en moins de 15 jours n'atteint ni les postes ni la CI.
- Aucun paquet n'exécute de code à l'installation sans décision explicite.
- Le navigateur n'exécute que du code issu du lockfile.
- Un secret indexé est bloqué avant le commit.

**Négatives**

- Un correctif de sécurité attend lui aussi 15 jours, sauf exclusion de sa version exacte. C'est
  pourquoi la revue des dépendances ne bloque que les failles critiques.
- Les montées sont manuelles et prennent du temps à chaque vague.
- La liste d'exclusions et celle des scripts se tiennent à la main. Une exclusion oubliée garde
  une porte ouverte.
- Une dépendance qui suit une étiquette mobile casse toute résolution à froid tant que sa
  dernière version a moins de 15 jours. La CI ne le voit pas : elle installe avec un lockfile
  figé.
- gitleaks doit être installé sur chaque poste, hors de pnpm.
- Tant que les actions GitHub ne sont pas épinglées par empreinte, elles échappent à la
  quarantaine et au verrouillage.

## Où trouver le détail

- [Configuration de pnpm](../../pnpm-workspace.yaml) : délai de quarantaine, liste d'exclusions,
  liste des scripts d'installation et surcharges.
- [Configuration de Dependabot](../../.github/dependabot.yml) : écosystèmes suivis, fréquence et
  délai d'attente.
- [Hook de pré-commit](../../.husky/pre-commit) : lancement de gitleaks.
- [Guide de contribution](../../CONTRIBUTING.md) : prérequis du poste, dont gitleaks, sans lequel
  le hook de pré-commit refuse le commit, et rôle de ce hook, qui formate les fichiers indexés avec
  Biome et cherche des secrets avec gitleaks.

## Références

- [ADR-010 : Styles : utilitaires du DSFR et intégration officielle de react-dsfr](./0010-styles-dsfr.md)
- [ADR-015 : CI sur GitHub Actions, infrastructure en HCL avec OpenTofu](./0015-ci-github-actions-et-opentofu.md)
- [Guide de contribution](../../CONTRIBUTING.md)
