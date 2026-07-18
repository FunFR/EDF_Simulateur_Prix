// Seul point de contact avec le registre global rempli par les scripts
// classiques de scripts/tarifs/** (voir scripts/tarifs-registry.js).
// Quand les tarifs seront refactorés en modules, seul ce fichier changera.
export function getAbonnements() {
    return window.abonnements ?? [];
}
