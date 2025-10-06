import { ssbSets } from "./random-teams";
import { PSEUDO_WEATHERS, changeSet, getName } from "./scripts";
import { Teams } from '../../../sim/teams';

export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	// Glint
	nephilimprayer: {
		name: "Nephilim Prayer",
		basePower: 0,
		category: "Status",
		shortDesc: "+25% HP; Safeguard/Lucky Chant; 70% +1 DEF.",
		desc: "Heals the user by 25% of its max HP. Starts Safeguard and Lucky Chant. 70% chance to raise the user's Defense by 1 stage.",
		accuracy: true,
		gen: 9,
		pp: 5,
		priority: 0,
		flags: { bypasssub: 1, metronome: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Sing', source);
			this.add('-anim', source, 'Work Up', source);
		},
		onHit(pokemon) {
			pokemon.side.addSideCondition('safeguard');
			pokemon.side.addSideCondition('luckychant');
		},
		secondary: {
			chance: 70,
			self: {
				boosts: {
					def: 1,
				},
			},
		},
		heal: [1, 4],
		type: "Normal",
		target: "self",
	},
	// Glint the Vast
	hammerfall: {
		accuracy: 90,
		basePower: 50,
		category: "Physical",
		shortDesc: "+Fire; User moves first in priority bracket next turn.",
		desc: "Combines Fire into its type effectiveness. If it hits, the user moves first in its priority bracket next turn.",
		name: "Hammerfall",
		gen: 9,
		pp: 5,
		priority: 0,
		flags: { contact: 1, metronome: 1, protect: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Hyper Voice', source);
			this.add('-anim', source, 'Raging Fury', target);
		},
		onEffectiveness(typeMod, target, type, move) {
			return typeMod + this.dex.getEffectiveness('Fire', type);
		},
		onHit(pokemon) {
			pokemon.addVolatile('hammerfall');
		},
		condition: {
			duration: 1,
			onFractionalPriority(priority, pokemon, target, move) {
				return 0.1;
			},
		},
		secondary: null,
		target: "normal",
		type: "Steel",
	},
	// Shifu Robot
	turbocharge: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Protects + HP becomes 1; x1.1 Spe/x1.2 Spa per 10% HP lost.",
		desc: "Protects the user from attacks this turn and the user's HP becomes 1. For each 10% max HP lost, the user has x1.1 Speed and x1.2 Special Attack, and this effect lasts one turn for each 10% max HP lost. Can't be used twice.",
		name: "Turbocharge",
		gen: 9,
		pp: 1,
		priority: 6,
		flags: { metronome: 1, },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Agility', source);
			this.add('-anim', source, 'Discharge', source);
		},
		onHit(pokemon) {
			pokemon.addVolatile('protect');
		},
		condition: {
			onStart(pokemon) {
				pokemon.abilityState.disabled = true;
				// e.g if used when at 243/301 HP, loss is 242, which when divided by max HP, says
				// 243/301 is 80.3% HP lost. Multiplying by 10 moves back the decimal one place and
				// tells the formula that the user has 8 stacks of turbocharge; one for each 10% out of the 80%
				let loss = pokemon.hp - 1;
				this.damage(loss, pokemon, this.dex.getActiveMove('turbocharge'));
				this.effectState.charges = Math.floor((loss/pokemon.maxhp)*10)
			},
			onModifySpe(spe, pokemon) {
				// Should be +10% (x1.1) for each charge
				return this.chainModify(1+(0.1*this.effectState.charges));
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				// Should be +20% (x1.2) for each charge
				return this.chainModify(1+(0.2*this.effectState.charges));
			},
			onTryHeal(damage, target, source, effect) {
				return false;
			},
			onResidual(pokemon) {
				if (this.effectState.charges) {
					this.add('-anim', pokemon, 'Discharge', pokemon);
					this.add('-message', `${pokemon.name} is turbocharged!`);
					this.effectState.charges--;
				} else {
					pokemon.removeVolatile('turbocharged');
				}
			},
			onEnd(pokemon) {
				this.add('-message', `${pokemon.name}'s turbocharge wore off!`);
			},
		},
		secondary: null,
		volatileStatus: 'turbocharge',
		target: "self",
		type: "Electric",
	},
};
