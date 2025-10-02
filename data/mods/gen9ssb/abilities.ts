import { ssbSets } from "./random-teams";
import { changeSet, getName, PSEUDO_WEATHERS } from "./scripts";

const STRONG_WEATHERS = ['desolateland', 'primordialsea', 'deltastream', 'deserteddunes', 'millenniumcastle'];

export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	autorepair: {
		name: "Auto-Repair",
		// Implemented in ../../formats.ts
	},
};
	/*
	// Example
	abilityid: {
		shortDesc: "", // short description, shows up in /dt
		desc: "", // long description
		name: "Ability Name",
		// The bulk of an ability is not easily shown in an example since it varies
		// For more examples, see https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
	},
	*/
