<template>
    <div class="UserProfile">
        <VKView v-bind="$attrs" activePanel="panel">
            <Panel id="panel">
                <PanelHeader>{{title}}</PanelHeader>

                <FormLayout>
                    <SelectMimicry
                        top="Выберите город"
                        placeholder="Не выбран"
                        :onClick="cityPopupOpen"
                    >
                        {{selectedCityName}}
                    </SelectMimicry>
                </FormLayout>
            </Panel>
        </VKView>
        <VKView id="citySelectionView" activePanel="panel" key="citySelectionView">
            <Panel id="panel">
                <PanelHeader>Выбор города</PanelHeader>
                test
            </Panel>
        </VKView>
    </div>
</template>

<script>

import '@denull/vkui'

export default {
    name: 'UserProfile',
    props: {
        title: String
    },
    computed: {
        selectedCityName() {
            if (this.profile && this.profile.city) {
                return this.profile.city.name;
            }

            return '';
        }
    },
    data() {
        return {
            activeView: 'profile',
            profile: {
                city: {
                    id: 0,
                    name: 'Санкт-Петербург'
                }
            },
            cities: [
                {
                    id: 1,
                    name: 'Санкт-Петербург'
                }, {
                    id: 2,
                    name: 'Москва'
                }, {
                    id: 3,
                    name: 'Казань'
                }
            ]
        }
    },
    methods: {
        cityPopupOpen() {
            this.activeView = 'citySelectionView'
        }
    }
}

</script>

<style>

.UserProfile {
    border: 1px solid #E5E5E5;
    width: 400px;
    margin: 40px auto;
    text-align: left;
}

</style>