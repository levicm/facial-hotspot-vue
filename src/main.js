import Vue from 'vue'
import App from './App.vue'

// VueMaterial to get better UI
import { MdCard } from 'vue-material/dist/components';
import { MdButton } from 'vue-material/dist/components';
import { MdField } from 'vue-material/dist/components';
import { MdDialog } from 'vue-material/dist/components';
import { MdDialogAlert } from 'vue-material/dist/components';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';
Vue.use(MdCard);
Vue.use(MdButton);
Vue.use(MdField);
Vue.use(MdDialog);
Vue.use(MdDialogAlert);

// VueResource to integrate with backend API
import VueResource from 'vue-resource';
Vue.use(VueResource);

// Vue The Mask
import VueTheMask from 'vue-the-mask'
Vue.use(VueTheMask)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
