<template>
    <div class="UserProfile">
        <VKView v-bind="$attrs" :activePanel="activePanel">
            <Panel id="Profile">
                <PanelHeader>Профиль</PanelHeader>

                <Group v-if="VKProfile.id">
                    <Cell size="l"
                        :description="VKProfile.city.title"
                    >
                        <Button level="secondary" slot="bottomContent">Редактировать</Button>
                        {{VKProfileFullName}}
                        <Avatar :src="VKProfile.photo_100" :size="80" slot="before" />
                    </Cell>
                </Group>

                <Group>
                    <Div><center><Button @click="DSProfileGet">
                        Получить профиль DS
                    </Button></center></Div>
                    <Div><center><Button @click="VKProfileGet">
                        Получить профиль VK
                    </Button></center></Div>

                    <Div><pre>{{DSProfile}}</pre></Div>
                </Group>

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
    computed: {
        VKProfileFullName() {
            return this.VKProfile.first_name + ' ' + this.VKProfile.last_name;
        }
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
    mounted() {
        this.VKAuth()
    },
    methods: {
        VKAuth() {
            VKC.init(VK_ACCESS_TOKEN, () => {
                VKC.auth(VK_APP_ID, 'email,friends', () => {
                    this.VKProfileGet();
                });
            });
        },
        VKProfileGet() {
            VKC.quickApi('users.get', {
                fields: 'sex,bdate,photo_100,city,country'
            }, (data) => {
                if (data.data.response && data.data.response.length) {
                    this.VKProfile = data.data.response[0]
                }
            });
        },
        DSProfileGet() {
            this.VKProfile.id = 5000

            dsApi.send('users/' + this.VKProfile.id, {}, (data) => {
                debugger;
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

pre {
    white-space: pre-wrap;
}

</style>
