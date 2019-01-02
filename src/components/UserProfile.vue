<template>
    <VKView v-bind="$attrs" :activePanel="activePanel" class="UserProfile">
        <Alert :actions="alertActions" slot="popout" v-if="alertShown" :onClose="closeAlert">
            Необходимо указать и сохранить свой город!
        </Alert>

        <Panel id="Profile">
            <PanelHeader>
                DonorSearch
            </PanelHeader>

            <Group class="DonationsStats" v-if="Donations.length">
                <List>
                    <Cell>
                        <vkui-icon :size="24" name="like" style="color: red" slot="before" :class="{shown: Donations.length}" />
                        <span style="color: red">{{ savedPeopleText }}</span>
                    </Cell>
                </List>
            </Group>

            <Group>
                <template v-if="!DSProfileReady">
                    <Spinner class="ProfileLoadingSpinner" />
                </template>
                <Cell class="UserProfileBlock" size="l" :class="{shown: DSProfileReady}"
                    :description="DSProfile.city_title"
                >
                    <Button level="secondary" slot="bottomContent" @click="ProfileEditOpen">
                        Редактировать
                    </Button>
                    {{DSProfile.first_name}} {{DSProfile.last_name}}
                    <Avatar v-if="DSProfile.avatar" :src="DSProfile.avatar" :size="80" slot="before" />
                </Cell>
            </Group>

            <Group>
                <Header level="2">
                    <span slot="aside" class="citySavedNotification"
                        :class="{
                            shown: CitySelection._saved !== false,
                            error: CitySelectionSavedError,
                            success: CitySelectionSavedSuccess
                        }">
                        {{CitySelectionSavedText}}
                    </span>
                    Город сдачи
                </Header>
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

            <Group title="Что будете сдавать?" class="DonationTypesList">
                <List class="DonationTypes">
                    <Cell v-for="(type, index) in DonationTypes" :key="index" :description="type.text">
                        <Avatar :src="type.icon" :size="28" slot="before" />
                        {{type.title}}

                        <Checkbox v-model="DonationTypesMask[index]" slot="asideContent" />
                    </Cell>
                </List>
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

            <Group>
                <FormLayout>
                    <Input v-model="DSProfile.first_name" top="Имя" />
                    <Input v-model="DSProfile.last_name" top="Фамилия" />
                    <Input v-model="DSProfileBDate" top="Дата рождения" type="date" />

                    <Select placeholder="Выберите группу крови" top="Группа крови" v-model="DSProfile.blood_type">
                        <option v-for="(item, index) in BloodTypes" :key="index" :value="item">
                            {{item}}
                        </option>
                    </Select>

                    <Checkbox v-model="DSProfileNotFirst">Я уже сдавал кровь</Checkbox>



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

import { Input } from '@denull/vkui/src/components'
import { platform, IOS, ANDROID } from '@denull/vkui'

import _ from 'lodash'

import dsApi from '../DSApi'
import VKC from '../VK/VKC'
import { VK_ACCESS_TOKEN, VK_APP_ID } from '../tokens.js'

export default {
    name: 'UserProfile',
    props: {},
    computed: {
        savedPeopleText() {
            let count = this.Donations.length * 3;
            let _count = count % 10;

            if (count == 0) return 'Добро пожаловать!';

            if (_count == 0 || _count > 4) return count + ' жизней спасено!';
            if (_count >= 2 && _count < 5) return count + ' жизни спасено!';
            if (_count == 1) return count + ' жизнь спасена!';
        },


        ProfileSavedError() {
            return this.DSProfile._saved == 'error'
        },
        ProfileSavedSuccess() {
            return this.DSProfile._saved == 'ok'
        },
        ProfileSavedText() {
            if (this.DSProfile._saved == 'ok') return 'изменения сохранены';
            if (this.DSProfile._saved == 'error') return 'не удалось сохранить';
        },


        CitySelectionSavedError() {
            return this.CitySelection._saved == 'error'
        },
        CitySelectionSavedSuccess() {
            return this.CitySelection._saved == 'ok'
        },
        CitySelectionSavedText() {
            if (this.CitySelection._saved == 'ok') return 'сохранено';
            if (this.CitySelection._saved == 'error') return 'не сохранено';
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
        }
    },
    watch: {
        globalProfile(val) {
            this.DSProfile = Object.assign(this.DSProfile, val);
        },
        DSProfile(val) {
            let date = new Date(val.bdate);
            if (isNaN(date.getTime())) return '';
            this.DSProfileBDate = [
                date.getFullYear(),
                ('0' + (date.getMonth() + 1)).slice(-2),
                ('0' + date.getDate()).slice(-2)
            ].join('-');

            this.DSProfileNotFirst = !this.DSProfile.is_first_donor;

            this.DonationTypesMask = (!this.DSProfile.blood_class_ids)
                ?  new Array(6).fill(false)
                : (+this.DSProfile.blood_class_ids).toString(2).split('').reverse();
            this.DonationTypesMask = this.DonationTypesMask.map((v) => { return v == 1})
        },
        DonationTypesMask(val) {
            let mask = parseInt(val.map((v) => {
                return v ? '1' : '0'
            }).reverse().join(''), 2);

            if (mask != DSProfile.get('blood_class_ids')) {
                DSProfile.set({
                    blood_class_ids: mask
                }, true, (response) => {
                    Debug.log({'maskUpdated': response})
                });
            }
        }
    },
    data() {
        return {
            testModel: true,
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
            DSProfileBDate: null,
            DSProfileNotFirst: false,
            DSProfile: DSProfile.get(),
            VKProfile: {},

            // Объекта панели выбора города
            CitySelection: {
                search: '',
                empty: false,
                ready: true,
                list: []
            },

            BloodTypes: [
                '0(I) Rh+',
                '0(I) Rh-',
                'A(II) Rh+',
                'A(II) Rh-',
                'B(III) Rh+',
                'B(III) Rh-',
                'AB(IV) Rh+',
                'AB(IV) Rh-'
            ],

            Donations: [],

            // Массив типов донации
            DonationTypesMask: new Array(6).fill(false),
            DonationTypes: [
                {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/full_blood.svg',
                    title: 'Цельная кровь',
                    key: 'full_blood',
                    text: 'Процесс сдачи крови занимает буквально 10–15 минут. Цельную кровь рекомендуется сдавать, когда группа крови неизвестна',
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/plazma.svg',
                    title: 'Плазма',
                    key: 'plazma',
                    text: 'Применяется при массовых кровотечениях, ожогах. Рекомендуется для сдачи донорам AB(IV) Rh+ и AB(IV) Rh-'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/eritocites.svg',
                    title: 'Эритроциты',
                    key: 'eritocites',
                    text: 'По существующим правилам донорами могут быть только здоровые молодые мужчины. Рекомендуется для сдачи донорам 0(I) Rh+ и 0(I) Rh-'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/granulocites.svg',
                    title: 'Гранулоциты',
                    key: 'granulocites',
                    text: 'Играют ключевую роль в борьбе организма с бактериальными и некоторыми другими инфекциями'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/liekocites.svg',
                    title: 'Лейкоциты',
                    key: 'liekocites',
                    text: 'Применяются по показаниям лечащего врача при ряде онкологических заболеваний'
                }, {
                    icon: 'https://developer.donorsearch.org/design_elements/dropplets/trombocites.svg',
                    title: 'Тромбоциты',
                    key: 'trombocites',
                    text: 'Рекомендуется для сдачи донорам A(II) Rh+, A(II) Rh-, B(III) Rh+, B(III) Rh-'
                }
            ]
        }
    },
    mounted() {

        let self = this;
        EventBus.$on('VKCInit', () => {

            VKC.auth(Number(VK_APP_ID), 'email,friends', (data) => {
                Debug.log({'response': data})

                self.VKProfileGet(() => {
                    self.getDonations(self.VKProfile.id);

                    DSProfile.load({
                      vk_id: self.VKProfile.id,
                      city_title: self.VKProfile.city && self.VKProfile.city.title
                    }, (data) => {
                        data = DSProfile.setVK(self.VKProfile)

                        Debug.log({'users/get/success': data});

                        self.DSProfile = DSProfile.get();
                    }, (error) => {
                        Debug.log({'users/get/error': error});

                        self.DSProfile = DSProfile.get();
                    });
                });
            }, (error) => {
                Debug.log({'error': error})
            })
        });

        EventBus.$on('show-alert', () => {
          self.alertShown = true;
        });
    },
    methods: {
        getDonations(vk_id) {
            let self = this;

            dsApi.send('donations/' + vk_id, {type: 'successful'},
                (response) => {
                    self.Donations = response; // new Array(Math.ceil(Math.random() * 100)) // response;
                },
                (error) => {
                }
            );
        },

        // Профиль VKontakte
            VKProfileGet(callback = () => {}) {
                VKC.quickApi('users.get', {
                    fields: 'sex, bdate, photo_100, city, country'
                }, (data) => {
                    Debug.log({'users.get': data})

                    if (data.data.response && data.data.response.length) {
                        this.VKProfile = data.data.response[0]
                    }

                    callback();
                });
            },

        // Профиль DonorSearch
            DSProfileSave() {
                let self = this;
                let data = Object.assign(self.DSProfile, {
                    bdate: new Date(this.DSProfileBDate).toJSON(),
                    is_first_donor: !this.DSProfileNotFirst
                });

                DSProfile.set(data, true, (response) => {
                    Debug.log({'users/update/success': response});

                    if (response.error) {
                        self.DSProfile._saved = 'error';
                    } else if (response.isSuccess) {
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
                this.CitySelection.search = DSProfile.get('city_title')
                this.activePanel = 'CitySelection'
                this.CitySelectionChange(this.CitySelection.search)
            },
            CitySelectionClose() {

                this.activePanel = this.CitySelectionRedirect || 'Profile'
            },
            CitySelectionChange: _.debounce(
                function(e) {
                    let self = this;

                    if (e && e.length) {
                        self.CitySelection.empty = false;
                        self.CitySelection.ready = false;

                        dsApi.send('Cities/searchByPattern/' + e, {}, (data) => {
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
                let self = this;

                self.CitySelection.search = '';
                self.CitySelection.list = [];
                self.activePanel = 'Profile';

                if (!city) return;
                city = {
                    city_id: city.id,
                    city_title: city.title,
                    region_title: city.region && city.region.title
                };

                this.DSProfile.city_title = city.city_title

                DSProfile.set(city, true, (response) => {
                    if (response.isSuccess) {
                        self.CitySelection._saved = 'ok';
                    } else if (response.error) {
                        self.CitySelection._saved = 'error';
                    }

                    this.DSProfile = Object.assign(this.DSProfile, DSProfile.get())

                    setTimeout(function() {
                        self.CitySelection._saved = false;
                    }, 1000);
                }, () => {}, 'POST');
            },

            closeAlert() {
              this.alertShown = false;
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

.DonationTypesList .Cell__description:not(:empty) {
    overflow: visible;
    white-space: initial;
    line-height: 20px;
}

.DonationsStats .Icon {
    opacity: 0;
    width: 0;
    transition: .2s;
}
.DonationsStats .Icon.shown {
    opacity: 1;
    width: 24px;
}
.DonationsStats {
    background: transparent;
}
.DonationsStats:before,
.DonationsStats:after {
    display: none;
}
.DonationsStats .List {
    background: transparent;
}
.DonationsStats.Cell__before {
    justify-content: unset;
}
.DonationsStats .Cell__in {
    display: flex;
    justify-content: center;
}
.DonationsStats .Cell__main {
    display: inline-block;
    flex-grow: unset;
}

.DonationTypes .Cell__main {
    padding-right: 0;
}
.DonationTypes .Cell__indicator + .Cell__aside:not(:empty) {
    padding-left: 5px;
    margin-right: -15px;
}

</style>
