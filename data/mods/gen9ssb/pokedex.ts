export const Pokedex: import('../../../sim/dex-species').ModdedSpeciesDataTable = {
	/*
	// Example
	id: {
		inherit: true, // Always use this, makes the pokemon inherit its default values from the parent mod (gen7)
		baseStats: {hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100}, // the base stats for the pokemon
	},
	*/
	// Shifu Robot
	ironthorns: {
		inherit: true,
		types: ["Electric", "Steel"],
		abilities: { 0: "Auto-Repair" },
	},

	// Glint
	meltan: {
		inherit: true,
		abilities: { 0: "Augment the Giants" },
	},
	melmetal: {
		inherit: true,
		abilities: { 0: "Augment the Giants" },
	},

};
