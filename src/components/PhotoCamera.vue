<template>
    <div>
        <div class="message">
            <p v-show="!isCameraOpen">Procure um local iluminado e pressione o botão "Abrir Câmera" quando estiver
                pronto para a autenticação facial.</p>
            <p v-show="isCameraOpen && !isPhotoTaken">Olhe para a câmera e pressione o botão "Foto" quando estiver
                enquadrado.
            </p>
            <p v-show="isPhotoTaken">Se a foto parece boa, pressione o botão "Confirmar" para continuar.</p>
        </div>

        <div class="camera-button">
            <md-button v-show="!isCameraOpen && !isPhotoTaken" type="button" class="md-raised"
                @click="cancel">Voltar
            </md-button>
            <md-button type="button" class="md-raised is-rounded"
                :class="{ 'is-primary': !isCameraOpen, 'is-danger': isCameraOpen }" @click="toggleCamera">
                <span v-if="!isCameraOpen">Abrir Câmera</span>
                <span v-if="isCameraOpen && !isPhotoTaken">Cancelar</span>
                <span v-if="isPhotoTaken">Tentar outra</span>
            </md-button>
            <md-button v-show="isCameraOpen && !isPhotoTaken" type="button" class="md-raised md-primary"
                @click="takePhoto">Foto
            </md-button>
            <md-button v-show="isPhotoTaken" type="button" class="md-raised md-primary" @click="confirm">Confirmar
            </md-button>
        </div>
        <div v-if="!isLoading" class="camera-shoot">
        </div>

        <load-bar v-if="isLoading" class="camera-loading"></load-bar>

        <div class="camera-box">
            <video id="video" v-show="isCameraOpen && !isLoading && !isPhotoTaken" ref="camera" :width="videoWidth"
                :height="videoHeight" autoplay></video>
            <canvas v-show="isPhotoTaken" id="photoCanvas" ref="canvas" :width="canvasWidth"
                :height="canvasHeight"></canvas>
        </div>
    </div>
</template>

<script>
const FLASH_TIMEOUT = 50;
const CAMERA_TIMEOUT = 20000;

import LoadBar from './LoadBar.vue';

export default {
    name: "LoadBar",

    components: {
        'load-bar': LoadBar
    },

    props: {
        validate: {
            type: Function
        }
    },

    data() {
        return {
            isCameraOpen: false,
            isLoading: false,
            isPhotoTaken: false,
            isShotPhoto: false,

            videoWidth: 400,
            videoHeight: 300,
            canvasWidth: 400,
            canvasHeight: 300
        }
    },

    methods: {
        cancel() {
            this.$emit('cancel');
        },

        toggleCamera() {
            this.isCameraOpen = !this.isCameraOpen;
            if (this.isCameraOpen) {
                this.createCameraElement();
            } else {
                this.isPhotoTaken = false;
                this.stopCameraStream();
            }
        },

        createCameraElement() {
            this.isLoading = true;

            const constraints = (window.constraints = {
                audio: false,
                video: true
            });

            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(stream => {
                    this.isLoading = false;
                    this.$refs.camera.srcObject = stream;

                    setTimeout(() => {
                        if (this.isCameraOpen && !this.isPhotoTaken) {
                            this.toggleCamera();
                        }
                    }, CAMERA_TIMEOUT);
                })
                .catch(error => {
                    this.isLoading = false;
                    this.isCameraOpen = false;
                    alert("May the browser didn't support or there is some errors: " + error);
                });
        },

        stopCameraStream() {
            let srcObject = this.$refs.camera.srcObject;
            if (srcObject != null) {
                let tracks = srcObject.getTracks();

                tracks.forEach(track => {
                    track.stop();
                });
            } else {
                this.isLoading = false;
                this.isCameraOpen = false;
            }
        },

        takePhoto() {
            if (!this.isPhotoTaken) {
                this.isShotPhoto = true;

                setTimeout(() => {
                    this.isShotPhoto = false;
                }, FLASH_TIMEOUT);
            }

            this.isPhotoTaken = !this.isPhotoTaken;

            const photoCanvas = document.getElementById("photoCanvas");
            this.updateCanvasSize(photoCanvas);

            const context = this.$refs.canvas.getContext('2d');
            context.drawImage(this.$refs.camera, 0, 0, photoCanvas.width, photoCanvas.height);
            this.stopCameraStream();
        },

        updateCanvasSize(canvas) {
            const video = document.getElementById("video");
            const photoWidth = (video.videoWidth / video.videoHeight) * this.canvasHeight;
            canvas.width = photoWidth;
        },

        getImageContent() {
            return document.getElementById("photoCanvas").toDataURL("image/jpeg");
        },

        confirm() {
            if (this.validate) {
                if (!this.validate()) {
                    return;
                }
            }
            this.$emit('confirm', this.getImageContent());
            this.isLoading = false;
            this.isCameraOpen = false;
            this.isPhotoTaken = false;
        }
    }
}
</script>

<style scoped>
.camera-button {
    margin-bottom: 2rem;
}

.camera-loading {
    overflow: hidden;
    height: 20%;
    position: absolute;
    width: 100%;
    min-height: 50px;
    margin: 1rem 0 0 -2.0rem;
}
</style>