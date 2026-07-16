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
