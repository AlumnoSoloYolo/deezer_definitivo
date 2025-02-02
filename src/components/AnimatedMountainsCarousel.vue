<!-- AnimatedMountains.vue -->
<template>
    <div class="mountains-background">
      <svg 
        viewBox="0 0 1200 300" 
        class="mountains-svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <path 
          v-for="(mountain, index) in mountains" 
          :key="index"
          :d="mountain.path"
          fill="#A238FF"
        >
          <animate
            attributeName="d"
            :dur="`${0.7 + (index % 3) * 0.2}s`"
            repeatCount="indefinite"
            :values="mountain.animation"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            :begin="`${index * 0.1}s`"
          />
        </path>
      </svg>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const createMountainPath = (x, width) => {
    const baseY = 300; // Base
    const topY = 200; // Altura normal
    const animTopY = 180; // Altura máxima de animación
    const overlap = width * 0.5; // Superposición para suavidad
    
    const createSmoothPeakPath = (height) => {
      const startX = x - overlap;
      const endX = x + width + overlap;
      const centerX = x + width/2;
      
      // Puntos de control para la pendiente empinada
      const control1X = startX + width * 0.2;
      const control2X = centerX - width * 0.2;
      const control3X = centerX + width * 0.2;
      const control4X = endX - width * 0.2;
      
      // Altura de los puntos de control
      const baseControlY = height + 35;
      const midControlY = height + 8;
      const topControlY = height + 2; // Punto de control cerca del tope para suavizar el pico
      
      return `
        M ${startX},${baseY} 
        L ${startX},${height + 40}
        C ${control1X},${baseControlY} ${control2X},${midControlY} ${centerX - width * 0.1},${topControlY}
        S ${centerX},${height} ${centerX + width * 0.1},${topControlY}
        C ${control3X},${midControlY} ${control4X},${baseControlY} ${endX},${height + 40}
        L ${endX},${baseY} 
        Z
      `.replace(/\s+/g, ' ').trim();
    };
    
    return {
      path: createSmoothPeakPath(topY),
      animation: `
        ${createSmoothPeakPath(topY)};
        ${createSmoothPeakPath(animTopY)};
        ${createSmoothPeakPath(topY)}
      `
    };
  };
  
  const mountains = computed(() => {
    const totalWidth = 1200;
    const mountainCount = 50;
    const mountainWidth = (totalWidth / mountainCount);
    
    return Array.from({ length: mountainCount }, (_, i) => {
      const x = i * mountainWidth;
      return createMountainPath(x, mountainWidth);
    });
  });
  </script>
  
  <style scoped>
  .mountains-background {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    background-color: #0F0D13;
    pointer-events: none;
    z-index: 1;
  }
  
  .mountains-svg {
    width: 100%;
    height: 100%;
  }
  </style>