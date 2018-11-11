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
				<Cell title="Не есть!" description="Никогда!">
					<vkui-icon :size="24" name="error" slot="before" />
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