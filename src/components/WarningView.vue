<template>
	<Panel id="warnings">
		<PanelHeader>
			<HeaderButton slot="left" @click="WarningsClose">
                <template v-if="osname === 'IOS'">
                    Отмена
                </template>
                <vkui-icon :size="24" name="cancel" v-else />
            </HeaderButton>

			Противопоказания
		</PanelHeader>

		<Group>
			<List>
				<Cell description="Никогда!">
					<vkui-icon :size="24" name="error" slot="before" />

					Не есть!
				</Cell>

				<Cell description="Вообще!">
					<vkui-icon :size="24" name="error" slot="before" />

					И не пить!
				</Cell>
			</List>
		</Group>

		<Group>
			<List>
				<Cell description="Для количества!">
					<vkui-icon :size="24" name="error" slot="before" />

					Ну и не спать!
				</Cell>
			</List>
		</Group>
	</Panel>
</template>

<script>

export default {
	components: {
		Panel, Group, List, Cell, PanelHeader, HeaderButton
	},
	name: 'WarningView',
	data() {
		return {

		}
	},
	methods: {

	}
}

</script>

<style>

</style>