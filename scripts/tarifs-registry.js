// Registre global des abonnements, rempli par les fichiers scripts/tarifs/**.
// Doit rester un script classique chargé avant les tarifs : ceux-ci y accèdent
// via l'identifiant global nu `abonnements` (leur refactoring viendra plus tard).
window.abonnements = [];
