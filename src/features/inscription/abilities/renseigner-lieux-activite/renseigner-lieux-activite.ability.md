# Feature: Renseigner ses lieux d’activité

## Rule: Renseigner ses lieux d’activité franchit l’étape

### Scenario: Renseigner un lieu franchit l’étape et le confie au rattachement

* Given je suis un médiateur en cours d’inscription
* When je renseigne un lieu connu de la coop comme lieu d’activité
* Then l’étape lieux d’activité est franchie
* And ce lieu est confié au rattachement

## Rule: Renseigner remplace l’ensemble des lieux d’activité

### Scenario: Un lieu retiré de la liste est clôturé

* Given je suis un médiateur en cours d’inscription
* And j’exerce déjà dans un ancien lieu
* When je renseigne un lieu connu de la coop comme lieu d’activité
* Then l’étape lieux d’activité est franchie
* And ce lieu est confié au rattachement
* And mon ancien lieu d’activité est retiré
