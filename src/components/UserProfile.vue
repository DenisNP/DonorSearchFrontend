<template>
    <div class="UserProfile">
        <VKView v-bind="$attrs" :activePanel="activePanel">
            <Panel id="Profile">
                <PanelHeader>Профиль</PanelHeader>

                <Group title="Кто ты?">
                    <Div>
                        <pre>{{profile}}</pre>
                    </Div>
                </Group>

                <Group title="Где сдавать?">
                    <List>
                        <Cell expandable :onClick="citySelectionOpen">
                            <vkui-icon :size="24" name="place" slot="before" />
                            {{selectedCityName}}
                        </Cell>
                    </List>
                </Group>

                <Group title="Отладка">
                    <Div>
                        <Button @click="profile.city.name = 'Test'">Сменить город</Button>
                    </Div>
                </Group>
            </Panel>
            <Panel id="CitySelection">
                <PanelHeader noShadow>
                    <HeaderButton key="add" slot="right">
                        <vkui-icon :size="24" name="add" />
                    </HeaderButton>

                    Выбор города
                </PanelHeader>

                <Search :value="CitySelection.search" :onChange="CitySelectionChange" />

                <List>
                    <Cell v-for="item in CitySelection.list" :key="item.id">
                        {{item.name}}
                    </Cell>
                </List>
            </Panel>
        </VKView>
    </div>
</template>

<script>

import '@denull/vkui'
import dsApi from '../DSApi'

export default {
    name: 'UserProfile',
    props: {},
    computed: {
        selectedCityName() {
            if (this.profile && this.profile.city && this.profile.city.name) {
                return this.profile.city.name;
            }

            return 'Город не выбран';
        }
    },
    mounted() {
        dsApi.send('users/1910986', {}, (data) => {
            this.profile = data
        })
    },
    data() {
        return {
            activePanel: 'Profile',
            profile: {
                city: {}
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
            ],

            CitySelection: {
                search: '',
                list: []
            }
        }
    },
    methods: {
        citySelectionOpen() {
            this.activePanel = 'CitySelection'
        },

        CitySelectionChange(e) {
            this.CitySelection.list.push(this.cities[1]);
            this.CitySelection.list.push(this.cities[2]);
            this.CitySelection.list.push(this.cities[3]);
        }
    }
}

</script>

<style>

.UserProfile {
    text-align: left;
}

</style>