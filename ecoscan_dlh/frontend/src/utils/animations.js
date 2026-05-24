// Konfigurasi Framer Motion untuk EcoScan
export const transitionNormal = { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] };

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Memberikan jeda antar elemen anak
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitionNormal,
  },
};

export const hoverScale = {
  scale: 1.02,
  y: -5,
  transition: { duration: 0.2 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8 },
  },
};

export const glassHover = {
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  transition: { duration: 0.2 },
};
