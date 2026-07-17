# Feature: Renseigner ses lieux d’activité

## Rule: Renseigner ses lieux d’activité franchit l’étape

### Scenario: Renseigner un lieu franchit l’étape et le rattache

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible
* When je renseigne ce lieu comme lieu d’activité
* Then l’étape lieux d’activité est franchie
* And ce lieu est un de mes lieux d’activité actifs

## Rule: Renseigner remplace l’ensemble des lieux d’activité

### Scenario: Un lieu retiré de la liste est clôturé

* Given je suis un médiateur en cours d’inscription
* And j’ai déjà un lieu d’activité rattaché
* And un lieu d’activité est disponible
* When je renseigne ce lieu comme lieu d’activité
* Then l’étape lieux d’activité est franchie
* And ce lieu est un de mes lieux d’activité actifs
* And mon ancien lieu d’activité est retiré

## Rule: Un nouveau lieu (nom + adresse géocodée) est matérialisé

### Scenario: Renseigner un nouveau lieu le crée et le rattache

* Given je suis un médiateur en cours d’inscription
* When je renseigne un nouveau lieu nommé "Maison France Services"
* Then l’étape lieux d’activité est franchie
* And un lieu d’activité nommé "Maison France Services" est créé et rattaché
