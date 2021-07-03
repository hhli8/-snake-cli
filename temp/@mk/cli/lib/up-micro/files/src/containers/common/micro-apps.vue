<template>
  <div class="micro-apps"></div>
</template>

<script>
import { start } from 'qiankun';
import { microApps } from '@/register-micro-apps';
export default {
  mounted() {
    this.genContainers();
    start();
  },
  methods: {
    genContainers() {
      microApps.forEach(({ container: name }) => {
        const div = document.createElement('div');
        div.id = name.startsWith('#') ? name.substring(1) : name;
        this.$el.appendChild(div);
      });
    }
  }
};
</script>
