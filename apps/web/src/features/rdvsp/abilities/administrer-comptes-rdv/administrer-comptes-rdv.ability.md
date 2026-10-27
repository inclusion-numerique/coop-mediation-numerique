# Feature: Administrer les comptes RDV Service Public

> L'administration suit les comptes RDV Service Public reliés à la coop : combien
> de rendez-vous chacun a remontés, et le détail de leurs synchronisations.

## Rule: L'administration liste les comptes reliés avec leurs rendez-vous

### Scenario: Un compte relié est listé avec le nombre de ses rendez-vous

* Given un compte RDV relié qui a remonté 2 rendez-vous
* When l'administration liste les comptes RDV
* Then ce compte est listé avec 2 rendez-vous

## Rule: Le détail n'existe que pour un utilisateur relié à RDV Service Public

### Scenario: Le détail d'un compte relié est consultable

* Given un compte RDV relié qui a remonté 2 rendez-vous
* When l'administration consulte le détail de ce compte
* Then le détail de ce compte est affiché

### Scenario: Un utilisateur sans compte RDV n'a pas de détail

* When l'administration consulte le détail d'un utilisateur sans compte RDV
* Then aucun détail n'est affiché
