<template>
    <VKView v-bind="$attrs" :activePanel="activePanel" class="UserProfile">
        <Panel id="Profile">
            <PanelHeader>
                Профиль DonorSearch
            </PanelHeader>

            <Group>
                <template v-if="!DSProfile._ready">
                    <Spinner class="ProfileLoadingSpinner" />
                </template>
                <Cell class="UserProfileBlock" size="l" :class="{shown: DSProfile._ready}"
                    :description="UserProfileCityTitle"
                >
                    <Button level="secondary" slot="bottomContent" @click="ProfileEditOpen">
                        Редактировать
                    </Button>
                    {{UserProfileFullName}}
                    <Avatar v-if="DSProfile.avatar" :src="DSProfile.avatar" :size="80" slot="before" />
                </Cell>
            </Group>

            <Group title="Где сдавать?">
                <List>
                    <Cell expandable
                        @click="CitySelectionOpen"
                        :indicator="osname !== 'ios' ? 'Выбрать' : ''"
                        :description="DSProfile.cityRegion"
                    >
                        <!-- <vkui-icon :size="24" name="place" slot="before" /> -->
                        {{DSProfile.cityTitle || 'Не выбран'}}
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
                <Div><pre>
                    {{debugData}}
                </pre></Div>
            </Group>
        </Panel>

        <Panel id="ProfileEdit">
            <PanelHeader>
                <HeaderButton slot="left" @click="ProfileEditClose">
                    <template v-if="osname === 'IOS'">
                        Отмена
                    </template>
                    <vkui-icon :size="24" name="cancel" v-else />
                </HeaderButton>

                Личные данные
            </PanelHeader>

            <!-- <div class="savedNotification" :class="{shown: DSProfile._saved}">
                <span>изменения сохранены</span>
            </div> -->

            <Group>
                <FormLayout>
                    <Input v-model="DSProfile.first_name" top="Имя" />
                    <Input v-model="DSProfile.last_name" top="Фамилия" />
                    <Input v-model="DSProfile.bdate" top="Дата рождения" type="date" />

                    <!-- <Input v-model="UserProfileCityTitle" top="Город сдачи" placeholder="Не выбран"
                        @focus="CitySelectionOpen('ProfileEdit')"
                    /> -->

                    <List>
                        <Cell expandable
                            @click="CitySelectionOpen"
                            :description="ProfileCityRegion"
                            :indicator="osname !== 'ios' ? 'Выбрать' : ''"
                        >
                            <vkui-icon :size="24" name="place" slot="before" />
                            {{ProfileCityTitle || 'Не выбран'}}
                        </Cell>
                    </List>

                    <div class="saveBtnContainer">
                        <Button @click="DSProfileSave">Сохранить</Button>
                        <span class="savedNotification" :class="{shown: DSProfile._saved}">
                            изменения сохранены
                        </span>
                    </div>
                </FormLayout>
            </Group>
        </Panel>

        <Panel id="CitySelection">
            <template v-if="osname == 'android'">
                <PanelHeader>
                    <Search theme="header"
                        :value="CitySelection.search"
                        @close="CitySelectionClose"
                        @input="CitySelectionChange"
                    />
                </PanelHeader>
            </template>

            <template v-else>
                <PanelHeader no-shadow>
                    <HeaderButton @click="CitySelectionClose" v-if="osname == 'ios'" slot="left">
                        <vkui-icon :size="24" name="browser_back" />
                    </HeaderButton>
                    Город сдачи
                </PanelHeader>
                <Search theme="default"
                    :value="CitySelection.search"
                    @close="CitySelectionClose"
                    @input="CitySelectionChange"
                />
            </template>

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
</template>

<script>

import Debug from '../Debug'
import EventBus from '../EventBus'

import '@denull/vkui'
// import { Input } from '@denull/vkui/src/components'
import { platform, IOS, ANDROID } from '@denull/vkui'

import _ from 'lodash'

import dsApi from '../DSApi'
import VKC from '../VK/VKC'
import { VK_ACCESS_TOKEN, VK_APP_ID } from '../tokens.js'

export default {
    name: 'UserProfile',
    props: {},
    computed: {
        //
        ProfileCityTitle() {
            return this.DSProfile.city.name;
        },
        ProfileCityRegion() {
            return this.DSProfile.city.region;
        },

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
            debugData: Debug.get,

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
        EventBus.$on('VKCInit', () => {
            let self = this;

            console.log('VKCInit')

            VKC.auth(VK_APP_ID, 'email,friends', (data) => {
                console.log('response', data)

                self.VKProfileGet();
                self.DSProfileGet();
            }, (error) => {
                console.log('error', data)
            })
        });
    },
    methods: {
        // Авторизация VKontakte
            VKAuth(callback = () => {}) {
                VKC.init(VK_ACCESS_TOKEN, () => {
                    VKC.auth(VK_APP_ID, 'email,friends', () => {
                        callback()
                    });
                });
            },

        // Профиль VKontakte
            VKProfileGet() {
                VKC.quickApi('users.get', {
                    fields: 'sex,bdate,photo_100,city,country'
                }, (data) => {
                    if (data.data.response && data.data.response.length) {
                        this.VKProfile = data.data.response[0]
                        this.VKProfile.id = 5000

                        this.DSProfileSet({
                            'first_name':   this.VKProfile.first_name,
                            'last_name':    this.VKProfile.last_name,
                            'bdate':        this.VKProfile.bdate,
                            'avatar':       this.VKProfile.photo_100,
                            'vkId':         this.VKProfile.id,
                            'city': {
                                id:         this.VKProfile.city.id,
                                name:       this.VKProfile.city.title,
                                region:     this.VKProfile.country.title
                            }
                        });
                    }
                });
            },

        // Профиль DonorSearch
            DSProfileGet() {
                this.VKProfile.id = 5000;

                dsApi.send('users/' + this.VKProfile.id, {}, (data) => {
                    for(let key in data) {
                        if (!data[key]) delete data[key];
                    }
                    this.DSProfileSet(Object.assign(data, {
                        _ready: true
                    }));
                }, () => {
                    this.DSProfileSet({
                        _ready: true
                    });
                });
            },
            DSProfileSet(data) {
                for(let key in data) {
                    if (!this.DSProfile[key] && data[key]) {
                        this.DSProfile[key] = data[key];
                    }
                }
                this.DSProfile = Object.assign({}, this.DSProfile);
            },
            DSProfileSave() {
                let self = this;

                self.DSProfile = { _saved: true };

                setTimeout(function() {
                    self.DSProfile = { _saved: false };
                }, 1500);

                return;

                if (!this.VKProfile.id) {
                    console && console.warn('invalid VKProfile.id');
                    return;
                }

                this.DSProfile.vkId = this.VKProfile.id;

                dsApi.send('users/' + this.VKProfile.id, this.DSProfile, (data) => {
                    console.log(data)
                }, 'POST')
            },

        // Редактирование данных профиля
            ProfileEditOpen() {

                this.DSProfile._saved = false;
                this.activePanel = 'ProfileEdit';
            },
            ProfileEditClose() {
                
                this.activePanel = 'Profile';
            },
            ProfileEditSave() {

                this.DSProfileSave();
                this.activePanel = 'Profile';
            },

        // Выбор города
            CitySelectionOpen(redirect) {
                if (typeof redirect !== 'string') redirect = 'Profile'
                this.CitySelectionRedirect = redirect
                this.CitySelection.search = this.UserProfileCityTitle
                this.activePanel = 'CitySelection'
            },
            CitySelectionClose() {

                this.activePanel = this.CitySelectionRedirect || 'Profile'
            },
            CitySelectionChange: _.debounce(
                function(e) {
                    dsApi.send('Cities/' + e, {}, (data) => {
                        console.log(data)
                    })

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

.savedNotification {
    color: #999;
    opacity: 0;
    transition: .2s;
    font-size: .8rem;
    height: 0;
}
.savedNotification.shown {
    opacity: 1;
}

.ProfileLoadingSpinner.Spinner--android,
.ProfileLoadingSpinner.Spinner--ios {
    position: absolute;
    top: 0;
    left: 0;
}
.UserProfileBlock {
    opacity: 0;
    transition: .3s;
    min-height: 104px;
}
.UserProfileBlock.shown {
    opacity: 1;
}

.Search--ios.Search--default .Search__after-width {
    background: transparent;
    color: transparent;
}

</style>
