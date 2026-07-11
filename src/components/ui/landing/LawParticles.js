import { motion } from "framer-motion";

const particles = [
  { icon: "⚖️", delay: 0, duration: 8, x: 10, y: 20, size: 24 },
  { icon: "⚖️", delay: 1.5, duration: 10, x: 85, y: 15, size: 20 },
  { icon: "⚖️", delay: 3, duration: 7, x: 15, y: 70, size: 18 },
  { icon: "📜", delay: 0.5, duration: 9, x: 75, y: 60, size: 22 },
  { icon: "📜", delay: 2, duration: 11, x: 25, y: 45, size: 16 },
  { icon: "📜", delay: 4, duration: 8, x: 90, y: 80, size: 20 },
  { icon: "📚", delay: 1, duration: 12, x: 5, y: 55, size: 18 },
  { icon: "📚", delay: 2.5, duration: 9, x: 80, y: 35, size: 22 },
  { icon: "🔨", delay: 3.5, duration: 10, x: 60, y: 75, size: 16 },
  { icon: "🔨", delay: 0.8, duration: 7, x: 40, y: 25, size: 20 },
];

export default function LawParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute text-white/8"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 5, -5, 0],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {particle.icon}
        </motion.div>
      ))}
      
      {/* Subtle geometric lines */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(143, 227, 216, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(15, 126, 117, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(12, 156, 143, 0.02) 0%, transparent 70%)
          `,
          backgroundSize: "200% 200%",
        }}
      />
    </div>
  );
}
