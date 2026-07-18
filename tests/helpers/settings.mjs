// Réglages par défaut du wizard (valeurs initiales des inputs d'index.html).
// La 3e plage 00:00 -> 00:00 est volontairement conservée : formatHCRange la
// rejette (start >= end), comportement à figer.
export function defaultSettings(kva) {
    return {
        kva,
        jourZenPlus: 1,
        hcRawRanges: [
            ['22:00', '23:59'],
            ['00:00', '07:00'],
            ['00:00', '00:00']
        ],
        includeCommunity: false
    };
}
