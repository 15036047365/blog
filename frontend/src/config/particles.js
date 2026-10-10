/**
 * tsparticles 粒子背景配置
 * 参考: https://particles.js.org/
 */
export const particlesOptions = {
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: 'push',
      },
      onHover: {
        enable: true,
        mode: 'repulse',
      },
    },
    modes: {
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 100,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: '#0E6E63',
    },
    links: {
      color: '#0E6E63',
      distance: 150,
      enable: true,
      // 正文不再有白卡片垫底，粒子直接压在 17px 汉字下面，
      // 所以连线和不透明度都比原来压低，让它退成纸纹而不是一张网
      opacity: 0.16,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce',
      },
      random: false,
      speed: 0.8,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 45,
    },
    opacity: {
      value: 0.26,
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 1, max: 4 },
    },
  },
  detectRetina: true,
}