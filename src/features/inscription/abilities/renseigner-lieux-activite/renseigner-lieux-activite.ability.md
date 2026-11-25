# Fonctionnalité: Renseigner ses lieux d’activité

## Règle: Renseigner ses lieux d’activité franchit l’étape

### Scénario: Renseigner un lieu franchit l’étape et le confie au rattachement

* Étant donné je suis un médiateur en cours d’inscription
* Quand je renseigne un lieu connu de la coop comme lieu d’activité
* Alors l’étape lieux d’activité est franchie
* Et ce lieu est confié au rattachement

## Règle: Renseigner remplace l’ensemble des lieux d’activité

### Scénario: Un lieu retiré de la liste est clôturé

* Étant donné je suis un médiateur en cours d’inscription
* Et j’exerce déjà dans un ancien lieu
* Quand je renseigne un lieu connu de la coop comme lieu d’activité
* Alors l’étape lieux d’activité est franchie
* Et ce lieu est confié au rattachement
* Et mon ancien lieu d’activité est retiré
