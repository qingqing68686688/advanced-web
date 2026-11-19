/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 页面共用：Canvas 粒子连线背景动画
 */
(function () {
  'use strict';

  const Wanghl_canvas = document.getElementById('Wanghl_canvas');
  if (!Wanghl_canvas) {
    return;
  }

  const Wanghl_ctx = Wanghl_canvas.getContext('2d');

  let Wanghl_width = 0;
  let Wanghl_height = 0;
  let Wanghl_particles = [];
  const Wanghl_linkDistance = 140;
  const Wanghl_mouseDistance = 190;

  const Wanghl_mouse = { x: -9999, y: -9999 };

  function Wanghl_getCount() {
    const Wanghl_area = Wanghl_width * Wanghl_height;
    return Math.max(36, Math.min(110, Math.round(Wanghl_area / 16000)));
  }

  function Wanghl_resize() {
    const Wanghl_dpr = Math.min(window.devicePixelRatio || 1, 2);
    Wanghl_width = window.innerWidth;
    Wanghl_height = window.innerHeight;

    Wanghl_canvas.width = Wanghl_width * Wanghl_dpr;
    Wanghl_canvas.height = Wanghl_height * Wanghl_dpr;
    Wanghl_canvas.style.width = Wanghl_width + 'px';
    Wanghl_canvas.style.height = Wanghl_height + 'px';

    Wanghl_ctx.setTransform(Wanghl_dpr, 0, 0, Wanghl_dpr, 0, 0);
    Wanghl_initParticles();
  }

  class Wanghl_Particle {
    constructor() {
      this.x = Math.random() * Wanghl_width;
      this.y = Math.random() * Wanghl_height;
      this.vx = (Math.random() - 0.5) * 0.55;
      this.vy = (Math.random() - 0.5) * 0.55;
      this.radius = Math.random() * 1.8 + 0.9;
      this.alpha = Math.random() * 0.45 + 0.35;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > Wanghl_width) {
        this.vx *= -1;
        this.x = Math.max(0, Math.min(Wanghl_width, this.x));
      }
      if (this.y < 0 || this.y > Wanghl_height) {
        this.vy *= -1;
        this.y = Math.max(0, Math.min(Wanghl_height, this.y));
      }
    }

    draw() {
      Wanghl_ctx.beginPath();
      Wanghl_ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      Wanghl_ctx.fillStyle = 'rgba(190, 224, 255, ' + this.alpha + ')';
      Wanghl_ctx.fill();
    }
  }

  function Wanghl_initParticles() {
    const Wanghl_count = Wanghl_getCount();
    Wanghl_particles = [];
    for (let Wanghl_i = 0; Wanghl_i < Wanghl_count; Wanghl_i++) {
      Wanghl_particles.push(new Wanghl_Particle());
    }
  }

  function Wanghl_drawLines() {
    for (let Wanghl_i = 0; Wanghl_i < Wanghl_particles.length; Wanghl_i++) {
      const Wanghl_p = Wanghl_particles[Wanghl_i];

      for (let Wanghl_j = Wanghl_i + 1; Wanghl_j < Wanghl_particles.length; Wanghl_j++) {
        const Wanghl_q = Wanghl_particles[Wanghl_j];
        const Wanghl_dx = Wanghl_p.x - Wanghl_q.x;
        const Wanghl_dy = Wanghl_p.y - Wanghl_q.y;
        const Wanghl_dist = Math.sqrt(Wanghl_dx * Wanghl_dx + Wanghl_dy * Wanghl_dy);

        if (Wanghl_dist < Wanghl_linkDistance) {
          const Wanghl_opacity = (1 - Wanghl_dist / Wanghl_linkDistance) * 0.22;
          Wanghl_ctx.beginPath();
          Wanghl_ctx.moveTo(Wanghl_p.x, Wanghl_p.y);
          Wanghl_ctx.lineTo(Wanghl_q.x, Wanghl_q.y);
          Wanghl_ctx.strokeStyle = 'rgba(140, 198, 255, ' + Wanghl_opacity + ')';
          Wanghl_ctx.lineWidth = 1;
          Wanghl_ctx.stroke();
        }
      }

      const Wanghl_mdx = Wanghl_p.x - Wanghl_mouse.x;
      const Wanghl_mdy = Wanghl_p.y - Wanghl_mouse.y;
      const Wanghl_mdist = Math.sqrt(Wanghl_mdx * Wanghl_mdx + Wanghl_mdy * Wanghl_mdy);

      if (Wanghl_mdist < Wanghl_mouseDistance) {
        const Wanghl_mopacity = (1 - Wanghl_mdist / Wanghl_mouseDistance) * 0.42;
        Wanghl_ctx.beginPath();
        Wanghl_ctx.moveTo(Wanghl_p.x, Wanghl_p.y);
        Wanghl_ctx.lineTo(Wanghl_mouse.x, Wanghl_mouse.y);
        Wanghl_ctx.strokeStyle = 'rgba(120, 195, 255, ' + Wanghl_mopacity + ')';
        Wanghl_ctx.lineWidth = 1;
        Wanghl_ctx.stroke();
      }
    }
  }

  function Wanghl_animate() {
    Wanghl_ctx.clearRect(0, 0, Wanghl_width, Wanghl_height);

    for (let Wanghl_i = 0; Wanghl_i < Wanghl_particles.length; Wanghl_i++) {
      Wanghl_particles[Wanghl_i].update();
      Wanghl_particles[Wanghl_i].draw();
    }

    Wanghl_drawLines();
    window.requestAnimationFrame(Wanghl_animate);
  }

  window.addEventListener('resize', Wanghl_resize);
  window.addEventListener('mousemove', function (Wanghl_e) {
    Wanghl_mouse.x = Wanghl_e.clientX;
    Wanghl_mouse.y = Wanghl_e.clientY;
  });
  document.addEventListener('mouseleave', function () {
    Wanghl_mouse.x = -9999;
    Wanghl_mouse.y = -9999;
  });

  Wanghl_resize();
  window.requestAnimationFrame(Wanghl_animate);
})();
