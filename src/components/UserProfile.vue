<template>
    <div class="UserProfile">
        <VKView v-bind="$attrs" :activePanel="activePanel">
            <Panel id="Profile">
                <PanelHeader>Профиль</PanelHeader>

                <Group v-if="this.DSProfile._ready">
                    <Cell size="l"
                        :description="UserProfileCityTitle"
                    >
                        <Button level="secondary" slot="bottomContent">Редактировать</Button>
                        {{UserProfileFullName}}
                        <Avatar :src="VKProfile.photo_100" :size="80" slot="before" />
                    </Cell>
                </Group>

                <Group title="Где сдавать?">
                    <List>
                        <Cell expandable @click="CitySelectionOpen" indicator="Выбрать">
                            <vkui-icon :size="24" name="place" slot="before" />
                            {{UserProfileCityTitle || 'Не выбран'}}
                        </Cell>
                    </List>
                </Group>

                

                <Group title="Когда сдавать?">
                    <List>
                        <Cell expandable @click="CitySelectionOpen" indicator="Выбрать">
                            <vkui-icon :size="24" name="place" slot="before" />
                            {{UserProfileCityTitle || 'Не выбран'}}
                        </Cell>
                    </List>
                </Group>

                <Group title="Что сдавать?">
                    <List class="DonationTypes">
                        <Cell v-for="(type, index) in DonationTypes" :key="index">
                            <Avatar :src="type.icon" :size="28" slot="before" />
                            {{type.title}}
                            <VKSwitch slot="asideContent" />
                        </Cell>
                    </List>
                </Group>
            </Panel>

            <Panel id="CitySelection">
                <PanelHeader no-shadow>
                    <Search theme="header"
                        :value="CitySelection.search"
                        @close="CitySelectionClose"
                        @input="CitySelectionChange"
                    />
                </PanelHeader>

                <List v-if="CitySelection.list.length">
                    <Cell v-for="(item, index) in CitySelection.list"
                        :key="index"
                        :description="item.region"
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
        UserProfileFullName() {
            let fullName = [];

            if (this.DSProfile.first_name) {
                fullName.push(this.DSProfile.first_name);
            } else if (this.VKProfile.first_name) {
                fullName.push(this.VKProfile.first_name);
            }

            if (this.DSProfile.last_name) {
                fullName.push(this.DSProfile.last_name);
            } else if (this.VKProfile.last_name) {
                fullName.push(this.VKProfile.last_name);
            }

            return fullName.join(' ');
        },
        UserProfileCityTitle() {
            let cityTitle = '';

            if (this.DSProfile.city && this.DSProfile.title) {
                cityTitle = this.DSProfile.city.title;
            } else if (this.VKProfile.city && this.VKProfile.city.title) {
                cityTitle = this.VKProfile.city.title;
            }

            return cityTitle;
        },
        UserProfileAvatar() {
            let avatar = '';

            if (this.DSProfile.avatar) {
                avatar = this.DSProfile.avatar;
            } else if (this.VKProfile.photo_100) {
                avatar = this.VKProfile.photo_100;
            }

            return avatar;
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
                    name: 'Санкт-Петербург',
                    region: 'Ленинградская область'
                }, {
                    id: 2,
                    name: 'Москва',
                    region: 'Московская область'
                }, {
                    id: 3,
                    name: 'Казань',
                    region: 'Казанская область'
                }
            ],

            CitySelection: {
                search: '',
                list: []
            },

            DonationTypes: [
                {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/full_blood.svg',
                    title: 'Цельная кровь'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/eritocites.svg',
                    title: 'Эритроциты'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/granulocites.svg',
                    title: 'Гранулоциты'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/liekocites.svg',
                    title: 'Лейкоциты'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/plazma.svg',
                    title: 'Плазма'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/trombocites.svg',
                    title: 'Тромбоциты'
                }
            ]
        }
    },
    mounted() {
        this.VKAuth(() => {
            this.VKProfileGet()
        })

        this.DSProfileGet()
    },
    methods: {
        VKAuth(callback = () => {}) {
            VKC.init(VK_ACCESS_TOKEN, () => {
                VKC.auth(VK_APP_ID, 'email,friends', () => {
                    callback()
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
                this.DSProfile = data;
                this.DSProfile._ready = true;
            });
        },

        CitySelectionOpen() {
            this.activePanel = 'CitySelection'
        },
        CitySelectionClose() {
            this.activePanel = 'Profile'
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

.DonationTypes .Avatar__img {
    background-color: transparent;
}

pre {
    white-space: pre-wrap;
}

</style>
