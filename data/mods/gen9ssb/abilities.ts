import { ssbSets } from "./random-teams";
import { changeSet, getName, PSEUDO_WEATHERS } from "./scripts";

const STRONG_WEATHERS = ['desolateland', 'primordialsea', 'deltastream', 'deserteddunes', 'millenniumcastle'];

export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	augmentthegiants: {
		name: "Augment the Giants",
		shortDesc: "After 1 turn, Meltan becomes Melmetal. After 2 turns, becomes Meltan.",
		desc: "If Glint, transforms into Glint the Vast after 1 turn. If Glint the Vast, transforms into Glint after 2 turns.",
		gen: 9,
		onStart(pokemon) {
			if (!pokemon.abilityState.init) {
				pokemon.abilityState.init = true
				pokemon.abilityState.turns = 0;
			}
		},
		onResidual(pokemon) {
			if (pokemon.activeTurns) pokemon.abilityState.turns++;
			if (pokemon.name === 'Glint' && pokemon.abilityState.turns >= 1) {
				this.add('-activate', pokemon, pokemon.ability)
				changeSet(this, source, ssbSets['Glint the Vast'], true);
				pokemon.abilityState.turns = 0;
			} else if (pokemon.name === 'Glint the Vast' && pokemon.abilityState.turns >= 2) {
				this.add('-activate', pokemon, pokemon.ability)
				changeSet(this, source, ssbSets['Glint'], true);
				pokemon.abilityState.turns = 0;
			} else {
				this.add('-anim', pokemon, 'Shift Gear', pokemon);
				this.add('-message', `${pokemon.name} is preparing to augment!`);
			}
		},
	},
	autorepair: {
		name: "Auto-Repair",
		shortDesc: "User is revived at 1 HP if 7 turns pass since fainting.",
		gen: 9,
		// Implemented in ../../../config/formats.ts
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
