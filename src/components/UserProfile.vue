<template>
    <VKView v-bind="$attrs" :activePanel="activePanel" class="UserProfile">
      <Alert :actions="alertActions" slot="popout" v-if="alertShown" :onClose="closeAlert">
        Необходимо авторизоваться!
      </Alert>
        <Panel id="Profile">
            <PanelHeader>
                Профиль DonorSearch
            </PanelHeader>

            <Group>
                <Div><pre>
                    {{globalProfile}}
                </pre></Div>

                <Div><pre>
                    {{DSProfile}}
                </pre></Div>
            </Group>

            <Group>
                <template v-if="!DSProfileReady">
                    <Spinner class="ProfileLoadingSpinner" />
                </template>
                <Cell class="UserProfileBlock" size="l" :class="{shown: DSProfileReady}"
                    :description="UserProfileCityTitle"
                >
                    <Button level="secondary" slot="bottomContent" @click="ProfileEditOpen">
                        Редактировать
                    </Button>
                    {{UserProfileFullName}}
                    <Avatar v-if="DSProfile.avatar" :src="DSProfile.avatar" :size="80" slot="before" />
                </Cell>
            </Group>

            <Group title="Город сдачи">
                <List>
                    <Cell expandable
                        @click="CitySelectionOpen"
                        :indicator="osname !== 'ios' ? 'Выбрать' : ''"
                        :description="ProfileCityRegion"
                    >
                        <!-- <vkui-icon :size="24" name="place" slot="before" /> -->
                        {{ProfileCityTitle || 'Не выбран'}}
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
                <!-- <Div><pre>
                    {{debugData}}
                </pre></Div> -->
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

                    <!-- <List>
                        <Cell expandable
                            @click="CitySelectionOpen"
                            :description="ProfileCityRegion"
                            :indicator="osname !== 'ios' ? 'Выбрать' : ''"
                        >
                            <vkui-icon :size="24" name="place" slot="before" />
                            {{ProfileCityTitle || 'Не выбран'}}
                        </Cell>
                    </List> -->

                    <div class="saveBtnContainer">
                        <Button @click="DSProfileSave">Сохранить</Button>

                        <span class="savedNotification"
                            :class="{
                                shown: DSProfile._saved !== false,
                                error: ProfileSavedError,
                                success: ProfileSavedSuccess
                            }">
                            {{ProfileSavedText}}
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

            <template v-if="(CitySelection.list.length || !CitySelection.ready) && !CitySelection.empty">
                <List>
                    <Cell v-for="(item, index) in CitySelection.list"
                        :key="index"
                        :description="item.region && item.region.title"
                        @click="CitySelectionChoose(item)"
                    >
                        {{item.title}}
                    </Cell>
                </List>

                <Spinner style="min-height: 62px" v-if="!CitySelection.ready" />
            </template>

            <Footer v-else>
                <template v-if="CitySelection.empty">Начните вводить город</template>
                <template v-else>Нет доступных городов</template>
            </Footer>
        </Panel>
    </VKView>
</template>

<script>

import DSProfile from '../DSProfile'

import Debug from '../Debug'
import EventBus from '../EventBus'

//import '@denull/vkui'
import { Input } from '@denull/vkui/src/components'
import { platform, IOS, ANDROID } from '@denull/vkui'

import _ from 'lodash'

import dsApi from '../DSApi'
import VKC from '../VK/VKC'
import { VK_ACCESS_TOKEN, VK_APP_ID } from '../tokens.js'

export default {
    name: 'UserProfile',
    props: {},
    watch: {
        DSProfile(val) {
            // debugger;
        }
    },
    computed: {
        ProfileSavedError() {
            return this.DSProfile._saved == 'error'
        },
        ProfileSavedSuccess() {
            return this.DSProfile._saved == 'ok'
        },
        ProfileSavedText() {
            return this.DSProfile._saved == 'ok'
            ? 'изменения сохранены'
            : 'не удалось сохранить'
        },

        DSProfileReady() {
            return DSProfile._loaded;
        },


        //
        ProfileCityTitle() {
            return DSProfile.get('city_title');
        },
        ProfileCityRegion() {
            return DSProfile.get('region_title');
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
    watch: {
        globalProfile(val) {
            this.DSProfile = Object.assign(this.DSProfile, val)
        }
    },
    data() {
        return {
            globalProfile: DSProfile,

            // Alert
            alertShown: false,
            alertActions: [
              {
                'title':'ОК',
                'action': this.closeAlert
              }
            ],

            // VKUI osname
            osname: platform(),
            debugData: Debug.get(),

            // Текущий экран в рамках UserProfile
            activePanel: 'Profile',

            // Данные от DonorSearch и от VKontakte
            DSProfile: DSProfile.get(),
            VKProfile: {},

            // Объекта панели выбора города
            CitySelection: {
                search: '',
                empty: false,
                ready: true,
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

            VKC.auth(Number(VK_APP_ID), 'email,friends', (data) => {
                Debug.log({'response': data})

                self.VKProfileGet(() => {
                    DSProfile.load(self.VKProfile.id, (data) => {
                        data = DSProfile.setVK(self.VKProfile)

                        Debug.log({'users/get/success': data});

                        self.DSProfile = DSProfile.get();
                        self.DSProfileReady = true;
                    }, (error) => {
                        Debug.log({'users/get/error': error});

                        self.DSProfile = DSProfile.get();
                        self.DSProfileReady = true;
                    });
                });
            }, (error) => {
                Debug.log({'error': error})
            })
        });

        let self = this;
        EventBus.$on('show-alert',() => {
          self.alertShown = true;
        });
    },
    methods: {
        // Профиль VKontakte
            VKProfileGet(callback = () => {}) {
                VKC.quickApi('users.get', {
                    fields: 'sex,bdate,photo_100,city,country'
                }, (data) => {
                    Debug.log({'users.get': data})

                    if (data.data.response && data.data.response.length) {
                        this.VKProfile = data.data.response[0]
                    }

                    callback();
                });
            },

        // Профиль DonorSearch
            DSProfileSave(data) {
                let self = this;

                DSProfile.set(data, true, (response) => {
                    Debug.log({'users/update/success': response});

                    if ('error' in response) {
                        self.DSProfile._saved = 'error';
                    }
                    if (response.isSuccess) {
                        self.DSProfile._saved = 'ok';
                    }
                    self.DSProfile = Object.assign({}, self.DSProfile)

                    setTimeout(function() {
                        self.DSProfile._saved = false;
                        self.DSProfile = Object.assign({}, self.DSProfile)
                    }, 1000);
                }, (error) => {
                    Debug.log({'users/update/error': error});
                });
            },

        // Редактирование данных профиля
            ProfileEditOpen() {

                this.DSProfile._saved = false;
                this.activePanel = 'ProfileEdit';
            },
            ProfileEditClose() {

                this.activePanel = 'Profile';
            },

        // Выбор города
            CitySelectionOpen(redirect) {
                if (typeof redirect !== 'string') redirect = 'Profile'
                this.CitySelectionRedirect = redirect
                this.CitySelection.search = this.UserProfileCityTitle
                this.activePanel = 'CitySelection'
                this.CitySelectionChange(this.CitySelection.search)
            },
            CitySelectionClose() {

                this.activePanel = this.CitySelectionRedirect || 'Profile'
            },
            CitySelectionChange: _.debounce(
                function(e) {
                    let self = this;

                    if (e.length) {
                        self.CitySelection.empty = false;
                        self.CitySelection.ready = false;

                        dsApi.send('Cities/' + e, {}, (data) => {
                            // Debug.log({['Cities/' + e]: data});

                            self.CitySelection.ready = true;
                            self.CitySelection.list = data
                        });
                    } else {
                        self.CitySelection.ready = true;
                        self.CitySelection.empty = true;
                    }

                    this.CitySelection.search = e
                }, 300
            ),
            CitySelectionChoose(city) {
                this.CitySelection.search = '';
                this.CitySelection.list = [];
                this.activePanel = 'Profile';

                if (!city) return;

                DSProfile.set({
                    city_id: city.id,
                    city_title: city.title,
                    region_title: city.region && city.region.title
                });
            },

            closeAlert() {
              this.alertShown = false;
              EventBus.$emit('VKCInit');
            }
    },
    components: {
      Input
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
