'use client';

import { useState, useEffect } from 'react';
import Particles from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticleBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 -z-10"
      options={{
        fullScreen: false,
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          color: { value: ['#7aa2f7', '#bb9af7'] },
          links: {
            color: '#7aa2f7',
            distance: 150,
            enable: true,
            opacity: 0.25,
            width: 1.2,
          },
          move: {
            enable: true,
            speed: 0.8,
            direction: 'none',
            outModes: { default: 'out' },
          },
          number: {
            value: 40,
            density: { enable: true },
          },
          opacity: { value: { min: 0.2, max: 0.6 } },
          size: { value: { min: 1, max: 3 } },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
          },
          modes: {
            grab: { distance: 200, links: { opacity: 0.5 } },
          },
        },
        detectRetina: true,
        responsive: [
          { maxWidth: 768, options: { particles: { number: { value: 20 } } } },
        ],
      }}
    />
  );
}
