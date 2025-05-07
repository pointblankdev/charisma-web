import { useCallback, useEffect, useState, useRef } from 'react';
import { loadFull } from 'tsparticles';
import Particles from 'react-tsparticles';
import styles from '../styles/Home.module.css';

const ParticlesConfig = {
  particles: {
    number: {
      value: 20,
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: '#ffffff'
    },
    shape: {
      type: 'circle',
      stroke: {
        width: 0,
        color: '#000000'
      },
      polygon: {
        nb_sides: 5
      },
      image: {
        src: 'img/github.svg',
        width: 100,
        height: 100
      }
    },
    opacity: {
      value: 0.7,
      random: false,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 2,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false
      }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#ffffff',
      opacity: 0.5,
      width: 1
    },
    move: {
      enable: true,
      speed: 4,
      direction: 'none' as any,
      random: false,
      straight: false,
      out_mode: 'out' as any,
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200
      }
    }
  },
  interactivity: {
    detect_on: 'canvas' as any,
    events: {
      onhover: {
        enable: true,
        mode: 'repulse'
      },
      onclick: {
        enable: true,
        mode: 'push'
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 400,
        line_linked: {
          opacity: 1
        }
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3
      },
      repulse: {
        distance: 200,
        duration: 0.4
      },
      push: {
        particles_nb: 4
      },
      remove: {
        particles_nb: 2
      }
    }
  },
  retina_detect: true
};

const ParticlesFix = Particles as any;

const ParticleBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const throttleRef = useRef<number | null>(null);

  // Initialize the particles
  const particlesInit = useCallback(async (engine: any) => {
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await null;
  }, []);

  // Handle mouse movement for parallax effect with throttling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (throttleRef.current !== null) return;

      throttleRef.current = window.setTimeout(() => {
        setMousePosition({
          x: e.clientX,
          y: e.clientY
        });
        throttleRef.current = null;
      }, 20); // 20ms throttle for smoother performance
    };

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (throttleRef.current !== null) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  // Calculate parallax offset (subtle movement)
  const offsetX = (mousePosition.x / windowSize.width - 0.5) * 8; // 8px max movement
  const offsetY = (mousePosition.y / windowSize.height - 0.5) * 6; // 6px max movement, less vertical movement

  return (
    <div
      id="particle-background"
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        transition: 'transform 0.8s cubic-bezier(0.215, 0.61, 0.355, 1)'
      }}
    >
      <ParticlesFix
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={ParticlesConfig}
        className="!absolute inset-0"
        height="100vh"
        width="100vw"
      ></ParticlesFix>
    </div>
  );
};

export default ParticleBackground;
