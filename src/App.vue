<template>
  <div id="app">
    <img src="./assets/logoEM.png" width="200">
    <h2>{{ msg }}</h2>
    <div v-show="!showLoginPanel && !showRegisterPanel">
      <p>Já é cadastrado na nossa rede? Entre apenas com o reconhecimento facial:</p>
      <md-button type="button" class="md-raised md-primary" @click="login">Quero entrar</md-button>

      <p>Ainda não é cadastrado na nossa rede? Faça um cadastro rapidinho:</p>
      <md-button type="button" class="md-raised md-primary" @click="register">Quero me cadastrar</md-button>
    </div>

    <div v-show="showLoginPanel || showRegisterPanel">
      <md-card md-with-hover>
        <md-card-header>
          <h3 v-if="showLoginPanel">Autenticação facial</h3>
          <h3 v-if="showRegisterPanel">Registro de novo usuário</h3>
        </md-card-header>

        <md-card-content>
          <form>
            <md-field v-if="showRegisterPanel">
              <label>Entre com seu CPF</label>
              <md-input id="cpfInput" v-show="showRegisterPanel" v-model="cpf" placeholder="CPF" required
                v-mask="'###.###.###-##'" />
              <span class="md-error">Campo requerido*</span>
            </md-field>
            <md-field v-if="showRegisterPanel">
              <label>Entre com seu NOME</label>
              <md-input id="nameInput" v-show="showRegisterPanel" v-model="name" placeholder="Nome" required />
              <span class="md-error">Campo requerido*</span>
            </md-field>
            <md-field v-if="showRegisterPanel">
              <label>Entre com seu E-MAIL</label>
              <md-input id="nameInput" v-show="showRegisterPanel" v-model="email" placeholder="E-Mail" type="email"
                required />
              <span class="md-error">Campo requerido*</span>
            </md-field>
            <photo-camera id="login-camera" @cancel="start" @confirm="confirm($event)"></photo-camera>
          </form>
        </md-card-content>
      </md-card>

      <md-dialog-alert :md-active.sync="showDialog" :md-title="dialogTitle" :md-content="dialogMessage" />

      <!--md-dialog :md-active.sync="showDialog">
        <md-dialog-title>Mensagem</md-dialog-title>
        <p>{{ message }}</p>
        <md-dialog-actions>
          <md-button class="md-primary" @click="showDialog = false">Fechar</md-button>
        </md-dialog-actions>
      </md-dialog-->
    </div>
  </div>
</template>

<script>
const BACKEND_ADDRESS = 'http://localhost:8000';

import PhotoCamera from './components/PhotoCamera.vue';
import { mask } from 'vue-the-mask'

export default {
  name: 'app',

  components: {
    'photo-camera': PhotoCamera
  },

  directives: { mask },

  data() {
    return {
      title: '',
      msg: 'Hotspot Social',
      showLoginPanel: false,
      showRegisterPanel: false,
      showDialog: false,

      dialogTitle: '',
      dialogMessage: '',

      cpf: '',
      name: '',
      email: ''
    }
  },

  created() {
    // alert('');
  },

  methods: {
    login() {
      this.showLoginPanel = true;
    },

    register() {
      this.showRegisterPanel = true;
    },

    start() {
      this.showLoginPanel = false;
      this.showRegisterPanel = false;
    },

    confirm($event) {
      console.log('confirm' + $event);
      if (this.showLoginPanel) {
        this.confirmLogin($event);
      } else {
        this.confirmRegister($event);
      }
    },

    confirmLogin($event) {
      const data = { user_id: 0, name: '', photo: $event }
      console.log(data);
      let promise = this.$http.post(BACKEND_ADDRESS + '/authenticate', data);
      promise.then(res => {
        console.log(res);
        if (res.status == 200) {
          res.json().then(result => {
            console.log('result(JSON)' + result);
            if (result.result == 'ok') {
              this.openDialog("Bem-vindo, " + result.user.name + '!');
              this.showLoginPanel = false;
            } else {
              this.openDialog(result.message, 'Erro na autenticação!');
            }
          });
        } else {
          this.openDialog(res.statusText, 'Erro!');
          this.showLoginPanel = false;
        }
      }).catch(data => {
        if (data.status == 404) {
          this.openDialog('Se ainda não é cadastrado, faça o cadastro.', 'Usuário não encontrado!');
        } else {
          this.openDialog(data.statusText, 'Erro!');
        }
        this.showLoginPanel = false;
      });
    },

    confirmRegister($event) {
      console.log(validar(this.cpf));
      // if (!validar(this.cpf)) {
      //   this.message = "CPF inválido!";
      //   this.showDialog = true;
      //   document.getElementById("cpfInput").focus();
      //   return;
      // }
      const data = { id: this.cpf.replaceAll('.', '').replace('-', ''), name: this.name, email: this.email, photo: $event };
      console.log(data);
      let promise = this.$http.post(BACKEND_ADDRESS + '/users', data);
      promise.then(res => res.json())
        .then(result => {
          console.log(result);
          if (result.result == 'ok') {
            this.openDialog("Usuário cadastrado com sucesso!");
            this.showRegisterPanel = false;
          } else {
            this.openDialog(result.message, "Erro no cadastro!");
          }
        }).catch(data => {
          this.openDialog(data.statusText, "Erro no cadastro: " + data.status);
        });
    },

    openDialog(message, title) {
      this.dialogMessage = message;
      this.dialogTitle = title != null ? title : 'Mensagem';
      this.showDialog = true;
    }
  }
}

// Validação de CPF
const validar = cpf => checkAll(prepare(cpf))

const notDig = i => !['.', '-', ' '].includes(i)
const prepare = cpf => cpf.trim().split('').filter(notDig).map(Number)
const is11Len = cpf => cpf.length === 11
const notAllEquals = cpf => !cpf.every(i => cpf[0] === i)
const onlyNum = cpf => cpf.every(i => !isNaN(i))

const calcDig = limit => (a, i, idx) => a + i * ((limit + 1) - idx)
const somaDig = (cpf, limit) => cpf.slice(0, limit).reduce(calcDig(limit), 0)
const resto11 = somaDig => 11 - (somaDig % 11)
const zero1011 = resto11 => [10, 11].includes(resto11) ? 0 : resto11

const getDV = (cpf, limit) => zero1011(resto11(somaDig(cpf, limit)))
const verDig = pos => cpf => getDV(cpf, pos) === cpf[pos]

const checks = [is11Len, notAllEquals, onlyNum, verDig(9), verDig(10)]
const checkAll = cpf => checks.map(f => f(cpf)).every(r => !!r)

</script>

<style>
#app {
  text-align: center;
  color: #2c3e50;
  margin: 2rem;
}
</style>