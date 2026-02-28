'use client';

import { motion, useReducedMotion } from 'framer-motion';
import ParticleBackground from './ParticleBackground';

const headlineWords = ['I', 'build', 'systems', 'that', 'scale.'];

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const skip = !!prefersReducedMotion;
  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + i * 0.12, duration: 0.5, ease: 'easeOut' as const },
    }),
  };

  const fadeUp = (delay: number) =>
    skip
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.6, ease: 'easeOut' as const },
        };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 px-4 hero-gradient">
      {/* Meng To aura orbs */}
      <div className="aura-orb aura-orb-1" aria-hidden="true" />
      <div className="aura-orb aura-orb-2" aria-hidden="true" />
      <div className="aura-orb aura-orb-3" aria-hidden="true" />
      <ParticleBackground />
      <div className="max-w-4xl mx-auto text-center">
        <motion.div className="mb-8" {...fadeUp(0.1)}>
          <picture>
            <source srcSet="/ryan-headshot.webp" type="image/webp" />
            <img
              src="/ryan-headshot.jpg"
              width={144}
              height={144}
              alt="Ryan Kirsch"
              className="w-36 h-36 rounded-full mx-auto object-cover border-2 border-electricBlue/40 shadow-lg shadow-electricBlue/10"
            />
          </picture>
        </motion.div>

        <motion.p
          className="font-mono text-electricBlue text-sm sm:text-base mb-4 tracking-wider"
          {...fadeUp(0.2)}
        >
          Data Engineering · Cloud Pipelines · ML-Ready Infrastructure
        </motion.p>

        <h1 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 gradient-text">
          {headlineWords.map((word, i) => (
            <motion.span
              key={word}
              custom={i}
              variants={skip ? undefined : wordVariants}
              initial={skip ? undefined : 'hidden'}
              animate={skip ? undefined : 'visible'}
              className="inline-block mr-[0.3em]"
            >
              {word}
            </motion.span>
          ))}{' '}
          <motion.span
            className="text-electricBlue inline-block"
            {...(skip
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.3 + headlineWords.length * 0.12, duration: 0.5, ease: 'easeOut' },
                })}
          >
            Full stop.
          </motion.span>
        </h1>

        <motion.p
          className="text-lg sm:text-xl text-mutedGray max-w-2xl mx-auto mb-10 leading-relaxed"
          {...fadeUp(0.9)}
        >
          Senior Data Engineer and Lead Backend Engineer at the Philadelphia Inquirer.
          I build data platforms and ETL/ELT pipelines using dbt, Dagster, PySpark, and Airflow,
          alongside cloud infrastructure and AI/ML systems handling millions of requests daily.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          {...fadeUp(1.1)}
        >
          <a
            href="#projects"
            className="px-8 py-3 bg-electricBlue text-navy font-bold shadow-[0_0_20px_rgba(42,195,222,0.35)] rounded-lg hover:scale-105 transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-electricBlue focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="px-8 py-3 border border-electricBlue text-electricBlue font-semibold rounded-lg hover:bg-electricBlue/10 hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-electricBlue focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Get In Touch
          </a>
        </motion.div>

        <motion.div className="max-w-md mx-auto mt-8" {...fadeUp(1.8)}>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-electricBlue/30 bg-electricBlue/10 text-electricBlue">
              💰 $220K+ cost savings
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-electricBlue/30 bg-electricBlue/10 text-electricBlue">
              📰 1M+ daily readers
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-electricBlue/30 bg-electricBlue/10 text-electricBlue">
              ☁️ 3 AWS certs
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
