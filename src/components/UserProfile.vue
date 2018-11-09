<template>
    <VKView v-bind="$attrs" activePanel="panel">
        <Panel id="panel">
            <PanelHeader>{{title}}</PanelHeader>
        </Panel>
    </VKView>
</template>

<script>

import { VKView, Panel, PanelHeader } from '@denull/vkui/src/components'

export default {
    name: 'UserProfile',
    components: {
        VKView, Panel, PanelHeader
    },
    props: {
        title: String
    },
    data() {
        return {
            activeView: 'profile',
            profile: {
                city: {
                    id: 0,
                    name: ''
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
        setState(data) {
            
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