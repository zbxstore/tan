<template>
    <div class="PriceLine">
        <img src="../assets/history.png" alt="">
    </div>
</template>

<script>
    export default {
        name: 'HelloWorld',
        data() {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        },
        props: ['propOptions'], //父组件传递的配置数据

        methods:{
            layMsg(){

            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
    .PriceLine{position: relative;
        p{position:absolute;}
    }
</style>
