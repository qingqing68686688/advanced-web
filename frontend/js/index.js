/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE
 */
(function () {
  const Wanghl_canvas = document.getElementById('Wanghl_canvas');
  const Wanghl_ctx = Wanghl_canvas.getContext('2d');

  let Wanghl_width = 0;
  let Wanghl_height = 0;
  let Wanghl_particles = [];
  const Wanghl_particleCount = 80;
  const Wanghl_lineDistance = 150;

  // 调整 canvas 尺寸
  function Wanghl_resize() {
    Wanghl_width = Wanghl_canvas.width = window.innerWidth;
    Wanghl_height = Wanghl_canvas.height = window.innerHeight;
  }

  // 粒子类
  class Wanghl_Particle {
    constructor() {
      this.x = Math.random() * Wanghl_width;
      this.y = Math.random() * Wanghl_height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > Wanghl_width) this.vx *= -1;
      if (this.y < 0 || this.y > Wanghl_height) this.vy *= -1;
    }

    draw() {
      Wanghl_ctx.beginPath();
      Wanghl_ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      Wanghl_ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      Wanghl_ctx.fill();
    }
  }

  // 初始化粒子
  function Wanghl_initParticles() {
    Wanghl_particles = [];
    for (let i = 0; i < Wanghl_particleCount; i++) {
      Wanghl_particles.push(new Wanghl_Particle());
    }
  }

  // 绘制连线
  function Wanghl_drawLines() {
    for (let i = 0; i < Wanghl_particles.length; i++) {
      for (let j = i + 1; j < Wanghl_particles.length; j++) {
        const Wanghl_dx = Wanghl_particles[i].x - Wanghl_particles[j].x;
        const Wanghl_dy = Wanghl_particles[i].y - Wanghl_particles[j].y;
        const Wanghl_dist = Math.sqrt(Wanghl_dx * Wanghl_dx + Wanghl_dy * Wanghl_dy);

        if (Wanghl_dist < Wanghl_lineDistance) {
          const Wanghl_opacity = 1 - Wanghl_dist / Wanghl_lineDistance;
          Wanghl_ctx.beginPath();
          Wanghl_ctx.moveTo(Wanghl_particles[i].x, Wanghl_particles[i].y);
          Wanghl_ctx.lineTo(Wanghl_particles[j].x, Wanghl_particles[j].y);
          Wanghl_ctx.strokeStyle = `rgba(255, 255, 255, ${Wanghl_opacity * 0.3})`;
          Wanghl_ctx.lineWidth = 1;
          Wanghl_ctx.stroke();
        }
      }
    }
  }

  // 动画循环
  function Wanghl_animate() {
    Wanghl_ctx.clearRect(0, 0, Wanghl_width, Wanghl_height);

    Wanghl_particles.forEach((Wanghl_p) => {
      Wanghl_p.update();
      Wanghl_p.draw();
    });

    Wanghl_drawLines();
    requestAnimationFrame(Wanghl_animate);
  }

  // 鼠标交互
  let Wanghl_mouseX = -9999;
  let Wanghl_mouseY = -9999;

  document.addEventListener('mousemove', function (Wanghl_e) {
    Wanghl_mouseX = Wanghl_e.clientX;
    Wanghl_mouseY = Wanghl_e.clientY;
  });

  document.addEventListener('mouseleave', function () {
    Wanghl_mouseX = -9999;
    Wanghl_mouseY = -9999;
  });

  // 初始化
  window.addEventListener('resize', function () {
    Wanghl_resize();
    Wanghl_initParticles();
  });

  Wanghl_resize();
  Wanghl_initParticles();
  Wanghl_animate();
})();
