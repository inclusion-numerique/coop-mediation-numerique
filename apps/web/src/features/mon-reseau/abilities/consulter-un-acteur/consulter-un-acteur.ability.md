# Feature: Consulter un acteur

> La fiche d'un acteur de l'annuaire : qui il est, comment le joindre, s'il est
> actif, et, pour le coordinateur qui la consulte, où il en est avec son équipe.

## Rule: Seule la fiche d'un acteur actif et inscrit se consulte

### Scenario: Un médiateur consulte la fiche d'un autre médiateur

* Given un médiateur Alex Martin
* And un médiateur qui consulte l’annuaire
* When il consulte la fiche d’Alex Martin
* Then la fiche présente Alex Martin
* And la fiche ne dit rien de l’équipe

### Scenario: La fiche d'un compte supprimé est introuvable

* Given un médiateur supprimé Alex Martin
* And un médiateur qui consulte l’annuaire
* When il consulte la fiche d’Alex Martin
* Then la fiche est introuvable

### Scenario: La fiche d'un compte dont l'inscription n'est pas validée est introuvable

* Given un médiateur non inscrit Alex Martin
* And un médiateur qui consulte l’annuaire
* When il consulte la fiche d’Alex Martin
* Then la fiche est introuvable

### Scenario: La fiche d'un identifiant qui n'en est pas un est introuvable

* Given un médiateur qui consulte l’annuaire
* When il consulte la fiche « pas-un-identifiant »
* Then la fiche est introuvable

## Rule: Le statut public suit la règle d'activité des utilisateurs

> Un médiateur est actif s'il a créé une activité ou un bénéficiaire dans les
> 30 derniers jours.

### Scenario: Un médiateur qui a saisi une activité il y a 10 jours est actif

* Given un médiateur Alex Martin dont la dernière activité date de 10 jours
* And un médiateur qui consulte l’annuaire
* When il consulte la fiche d’Alex Martin
* Then Alex Martin est actif

### Scenario: Un médiateur qui n'a jamais rien saisi n'a jamais été actif

* Given un médiateur Alex Martin
* And un médiateur qui consulte l’annuaire
* When il consulte la fiche d’Alex Martin
* Then Alex Martin n’a jamais été actif

## Rule: Le coordinateur voit où en est l'acteur avec son équipe

### Scenario: Un médiateur sans lien avec l'équipe peut y être invité

* Given un médiateur Alex Martin
* And un coordinateur qui consulte l’annuaire
* When il consulte la fiche d’Alex Martin
* Then Alex Martin est hors de son équipe

### Scenario: Un membre de l'équipe montre ses statistiques des 30 derniers jours

* Given un médiateur Alex Martin
* And un coordinateur qui consulte l’annuaire
* And Alex Martin est membre de son équipe
* When il consulte la fiche d’Alex Martin
* Then Alex Martin est membre de son équipe, sans activité ces 30 derniers jours

### Scenario: Un médiateur invité attend sa réponse

* Given un médiateur Alex Martin
* And un coordinateur qui consulte l’annuaire
* And il a invité Alex Martin dans son équipe
* When il consulte la fiche d’Alex Martin
* Then Alex Martin est invité dans son équipe

### Scenario: Un ancien membre reste dans les archives de l'équipe

* Given un médiateur Alex Martin
* And un coordinateur qui consulte l’annuaire
* And Alex Martin a quitté son équipe
* When il consulte la fiche d’Alex Martin
* Then Alex Martin est un ancien membre de son équipe

### Scenario: Un coordinateur ne se coordonne pas lui-même

* Given un coordinateur qui consulte l’annuaire
* When il consulte sa propre fiche
* Then l’acteur ne peut pas rejoindre son équipe

### Scenario: Un coordinateur qui ne fait pas de médiation ne rejoint pas d'équipe

* Given un coordinateur Alex Martin qui ne fait pas de médiation
* And un coordinateur qui consulte l’annuaire
* When il consulte la fiche d’Alex Martin
* Then l’acteur ne peut pas rejoindre son équipe
