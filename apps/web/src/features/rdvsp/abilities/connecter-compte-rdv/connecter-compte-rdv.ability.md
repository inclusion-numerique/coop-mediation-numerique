# Feature: Connecter un compte RDV Service Public

## Rule: La liaison exige que l'agent porte la même adresse e-mail que le compte La Coop

### Scenario: Lier un compte dont l'e-mail correspond

* Given un agent RDV Service Public portant l’e-mail du médiateur
* When je connecte mon compte RDV Service Public
* Then le compte est lié
* And le compte est enregistré avec les jetons reçus

### Scenario: Refuser un compte dont l'e-mail diffère

* Given un agent RDV Service Public portant l’e-mail "autre.agent@example.com"
* When je connecte mon compte RDV Service Public
* Then la connexion échoue avec l’erreur "EmailAgentDifferent"
* And aucun compte RDV n’est enregistré

## Rule: La fenêtre de synchronisation n'est ouverte qu'à la première connexion

### Scenario: Première connexion

* Given un agent RDV Service Public portant l’e-mail du médiateur
* When je connecte mon compte RDV Service Public
* Then la synchronisation démarre au début du jour courant

### Scenario: Reconnexion d'un compte existant

* Given un compte RDV déjà lié synchronisé depuis le "2026-01-15"
* And un agent RDV Service Public portant l’e-mail du médiateur
* When je connecte mon compte RDV Service Public
* Then la synchronisation démarre toujours au "2026-01-15"

## Rule: Une reconnexion répare le compte sans rien détruire

### Scenario: Reconnecter un compte en erreur

* Given un compte RDV en erreur "invalid_grant"
* And un agent RDV Service Public portant l’e-mail du médiateur
* When je connecte mon compte RDV Service Public
* Then le compte est lié
* And le compte ne porte plus d’erreur

### Scenario: Reconnecter un compte déconnecté

* Given un compte RDV déconnecté
* And un agent RDV Service Public portant l’e-mail du médiateur
* When je connecte mon compte RDV Service Public
* Then le compte est lié
* And le compte n’est plus marqué déconnecté

### Scenario: Reconnexion préservant les réglages du médiateur

* Given un compte RDV déjà lié affichant les rendez-vous dans les activités
* And un agent RDV Service Public portant l’e-mail du médiateur
* When je connecte mon compte RDV Service Public
* Then le compte affiche toujours les rendez-vous dans les activités

## Rule: Un code d'autorisation refusé interrompt la liaison

### Scenario: Code refusé par RDV Service Public

* Given un code d’autorisation refusé
* When je connecte mon compte RDV Service Public
* Then la connexion échoue avec l’erreur "CodeAutorisationRefuse"
* And aucun compte RDV n’est enregistré
