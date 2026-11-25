# Fonctionnalité: Détecter les doublons de bénéficiaires

## Règle: Deux bénéficiaires suffisamment similaires sont signalés comme doublon

### Scénario: Détecter un doublon évident

* Étant donné un doublon évident pour ce médiateur
* Quand je détecte les doublons
* Alors un doublon impliquant les bénéficiaires créés est détecté

### Scénario: Détecter un doublon dont le téléphone et l'email sont absents

* Étant donné un doublon sans téléphone ni email pour ce médiateur
* Quand je détecte les doublons
* Alors un doublon impliquant les bénéficiaires créés est détecté

### Scénario: Deux bénéficiaires distincts ne sont pas des doublons

* Étant donné deux bénéficiaires distincts pour ce médiateur
* Quand je détecte les doublons
* Alors aucun doublon n'implique les bénéficiaires créés
