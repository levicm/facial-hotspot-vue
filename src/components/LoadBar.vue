<template>
  <div>
    <ul class="load-circle">
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "LoadBar"
}
</script>

<style scoped>
.load-circle {
  display: block;
  height: 14px;
  margin: 0 auto;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  transform: translateX(-50%);
  position: absolute;
  width: 100%;
  padding: 0;
  z-index: 999999;
}

.load-circle li {
  display: block;
  float: left;
  width: 10px;
  height: 10px;
  line-height: 10px;
  padding: 0;
  position: relative;
  margin: 0 0 0 4px;
  background: #999;
  animation: preload 1s infinite;
  top: -50%;
  border-radius: 100%;
}

.load-circle li:nth-child(2) {
  animation-delay: .2s;
}

.load-circle li:nth-child(3) {
  animation-delay: .4s;
}

@keyframes preload {
  0% {
    opacity: 1
  }

  50% {
    opacity: .4
  }

  100% {
    opacity: 1
  }
}
</style>