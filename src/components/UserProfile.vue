<template>
    <div class="UserProfile">
        <VKView v-bind="$attrs" :activePanel="activePanel">
            <Panel id="Profile">
                <PanelHeader>Профиль</PanelHeader>

                <Group>
                    <template v-if="VKProfile.id">
                        <Header level="2">
                            Кто ты?
                        </Header>
                        <List>
                            <Cell><InfoRow title="VK ID">   {{VKProfile.id}}</InfoRow></Cell>
                            <Cell><InfoRow title="Имя">     {{VKProfile.first_name}}</InfoRow></Cell>
                            <Cell><InfoRow title="Фамилия"> {{VKProfile.last_name}}</InfoRow></Cell>
                        </List>
                    </template>

                    <Div v-else><center>
                        <Button @click="VKAuth">Войти через ВКонтакте</Button>
                    </center></Div>
                </Group>

                <Group title="Где сдавать?">
                    <List>
                        <Cell expandable @click="CitySelectionOpen" indicator="Выбрать">
                            <vkui-icon :size="24" name="place" slot="before" />
                            {{selectedCityName}}
                        </Cell>
                    </List>
                </Group>

                <Group title="Отладка">
                    <Div>
                        <pre>DSProfile: {{DSProfile}}</pre>
                        <pre>VKProfile: {{VKProfile}}</pre>
                    </Div>
                </Group>
            </Panel>
            <Panel id="CitySelection">
                <PanelHeader no-shadow>
                    <Search theme="header"
                        :value="CitySelection.search"
                        @input="CitySelectionChange"
                    />
                </PanelHeader>



                <List v-if="CitySelection.list.length">
                    <Cell v-for="(item, index) in CitySelection.list"
                        :key="index"
                        @click="CitySelectionChoose(item)"
                    >
                        {{item.name}}
                    </Cell>
                </List>

                <Footer v-else>Нет доступных городов</Footer>
            </Panel>
        </VKView>
    </div>
</template>

<script>

import '@denull/vkui'

import _ from 'lodash'

import dsApi from '../DSApi'
import VKC from '../VK/VKC'
import { VK_ACCESS_TOKEN, VK_APP_ID } from '../tokens.js'

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

    },
    data() {
        return {
            activePanel: 'Profile',
            DSProfile: {
                isEdit: false
            },
            VKProfile: {},
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
    created() {

    },
    methods: {
        VKAuth() {
            VKC.init(VK_ACCESS_TOKEN, () => {
                VKC.auth(VK_APP_ID, 'email,friends', () => {
                    VKC.quickApi('users.get', {}, (data) => {
                        if (data.data.response && data.data.response.length) {
                            this.VKProfile = data.data.response[0]
                        }
                    });
                });
            });
        },

        CitySelectionOpen() {
            this.activePanel = 'CitySelection'
        },

        CitySelectionChange: _.debounce(
            function(e) {
                if (!e.length) {
                    this.CitySelection.list = [];
                    this.CitySelection.search = '';
                    return;
                }

                this.CitySelection.search = e
                this.CitySelection.list.push(this.cities[Math.floor(Math.random()*this.cities.length)]);

                return

                dsApi.send('users/' + this.VKProfile.id, {}, (data) => {
                    debugger;
                });
            }, 200
        ),

        CitySelectionChoose(city) {
            this.DSProfile.city = city;
            this.CitySelection.search = '';
            this.CitySelection.list = [];
            this.activePanel = 'Profile';
        }
    }
}

</script>

<style>

.UserProfile {
    text-align: left;
}

</style>
