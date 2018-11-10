<template>
	<Group :title="title">
		<List>
			<Cell>
				<vkui-icon :name="icon" :size="24" />
				<Checkbox v-bind:value="value" v-on:input="$emit('input', $event.target.selected)">
					{{text}}
				</Checkbox>
			</Cell>
		</List>
	</Group>
</template>

<script>

import { Group, List, Cell, Checkbox } from '@denull/vkui/src/components'

export default {
	name: 'DSCard',
	props: [
		'title',
		'text',
		'icon',
		'value'
	],
	data() {
		return {}
	},
	methods() {

	},
	components: {
		Group, List, Cell, Checkbox
	}
}

</script>

<style>

</style>