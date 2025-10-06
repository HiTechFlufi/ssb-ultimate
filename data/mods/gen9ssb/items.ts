export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
	// Shifu Robot
	absorptiveshell: {
		name: "Absorptive Shell",
		gen: 9,
		onSwitchIn(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.addVolatile('forcefield');
			}
		},
		onResidual(pokemon) {
			const t = this.sample(['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Water']);
			pokemon.setType([t, 'Steel']);
			this.add('-start', pokemon, 'typechange', pokemon.getTypes(true).join('/'), '[from] item: Absorptive Shell');
		},
		onModifyMove(move, pokemon) {
			if (move.id === 'technoblast') {
				move.type = pokemon.getTypes()[0];
				this.add('-message', `${pokemon.name}'s ${move.name} became ${pokemon.abilityState.newType}-type!`);
			}
		},
	},
};
