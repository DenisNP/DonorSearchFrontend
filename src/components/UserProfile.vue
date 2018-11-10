<template>
    <div class="UserProfile">
        <VKView v-bind="$attrs" :activePanel="activePanel">
            <Panel id="Profile">
                <PanelHeader>Профиль</PanelHeader>

                <Group v-if="this.DSProfile._ready">
                    <Cell size="l"
                        :description="UserProfileCityTitle"
                    >
                        <Button level="secondary" slot="bottomContent" @click="ProfileEditOpen">Редактировать</Button>
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

                <Group title="Отладка">
                    <Div><pre>
                        {{DSProfile}}
                    </pre></Div>
                </Group>
            </Panel>

            <Panel id="ProfileEdit">
                <PanelHeader>
                    <HeaderButton slot="left">
                        <template v-if="osname === 'IOS'">
                            Отмена
                        </template>
                        <vkui-icon :size="24" name="cancel" v-else />

                    </HeaderButton>
                    Личные данные
                </PanelHeader>

                <Group>
                    <FormLayout>
                        <Input v-model="DSProfile.first_name" top="Имя" />
                        <Input v-model="DSProfile.last_name" top="Фамилия" />
                        <Input v-model="DSProfile.bdate" top="Дата рождения" type="date" />

                        <Button @click="ProfileEditSave">Сохранить</Button>
                    </FormLayout>
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
import { platform, IOS, ANDROID } from '@denull/vkui'

import _ from 'lodash'

import dsApi from '../DSApi'
import VKC from '../VK/VKC'
import { VK_ACCESS_TOKEN, VK_APP_ID } from '../tokens.js'

export default {
    name: 'UserProfile',
    props: {},
    computed: {
        // Наименование выбранного города пользователя
        selectedCityName() {
            if (this.profile && this.profile.city && this.profile.city.name) {
                return this.profile.city.name;
            }

            return 'Город не выбран';
        },

        // Приоритетные данных между DonorSearch и VKontakte
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
            // VKUI osname
            osname: platform(),

            // Текущий экран в рамках UserProfile
            activePanel: 'Profile',

            // Данные от DonorSearch и от VKontakte
            DSProfile: {},
            VKProfile: {},

            // Временный массив с городами. Заменится на запросы к API
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

            // Объекта панели выбора города
            CitySelection: {
                search: '',
                list: []
            },

            // Массив типов донации
            DonationTypes: [
                {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/full_blood.svg',
                    title: 'Цельная кровь',
                    key: 'full_blood'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/eritocites.svg',
                    title: 'Эритроциты',
                    key: 'eritocites'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/granulocites.svg',
                    title: 'Гранулоциты',
                    key: 'granulocites'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/liekocites.svg',
                    title: 'Лейкоциты',
                    key: 'liekocites'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/plazma.svg',
                    title: 'Плазма',
                    key: 'plazma'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/trombocites.svg',
                    title: 'Тромбоциты',
                    key: 'trombocites'
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
                    this.VKProfile.id = 5000
                }
            });
        },
        DSProfileGet() {
            this.VKProfile.id = 5000;

            dsApi.send('users/' + this.VKProfile.id, {}, (data) => {
                this.DSProfile = data;
                this.DSProfile._ready = true;
            }, () => {
                this.DSProfile._ready = true;
            });
        },
        DSProfileSet() {
            if (!this.VKProfile.id) {
                console.warn('invalid VKProfile.id');
                return;
            }

            this.DSProfile.vkId = this.VKProfile.id;

            dsApi.send('users/' + this.VKProfile.id, this.DSProfile, (data) => {
                console.log(data)
            }, 'POST')
        },

        // Редактирование данных профиля
        ProfileEditOpen() {

            this.activePanel = 'ProfileEdit';
        },
        ProfileEditSave() {

            this.DSProfileSet();
            this.activePanel = 'Profile';
        },

        // Выбор города
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
