// src/components/AiVisualizer.jsx
import React, { useEffect, useRef } from 'react';
import './Visualizer.module.css'; // Using the updated CSS

// Define the possible statuses using constants
export const STATUS = {
  IDLE: 'idle',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
};

const AiVisualizer = ({ status = STATUS.IDLE }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 300;
    canvas.height = 300;

    // Animation variables
    let animationFrameId;
    const particles = [];
    const particleCount = 150;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`,
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        life: Math.random() * 100 + 50,
      });
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw center orb
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        status === STATUS.LISTENING ? 60 : 50,
      );

      if (status === STATUS.LISTENING) {
        // Brighter, more active colors when listening
        gradient.addColorStop(0, "rgba(0, 255, 255, 0.9)");
        gradient.addColorStop(0.5, "rgba(128, 0, 255, 0.6)");
        gradient.addColorStop(1, "rgba(128, 0, 255, 0)");
      } else if (status === STATUS.SPEAKING) {
        // Purple colors when speaking
        gradient.addColorStop(0, "rgba(128, 0, 255, 0.9)");
        gradient.addColorStop(0.5, "rgba(0, 255, 255, 0.6)");
        gradient.addColorStop(1, "rgba(0, 255, 255, 0)");
      } else {
        // More subtle colors when idle
        gradient.addColorStop(0, "rgba(0, 255, 255, 0.7)");
        gradient.addColorStop(0.5, "rgba(128, 0, 255, 0.3)");
        gradient.addColorStop(1, "rgba(128, 0, 255, 0)");
      }

      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, status === STATUS.IDLE ? 30 : 40, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw pulsing ring
      const time = Date.now() / 1000;
      let pulseSize, pulseSpeed;
      
      if (status === STATUS.LISTENING) {
        pulseSize = 50 + Math.sin(time * 4) * 10; // Faster, larger pulse when listening
        pulseSpeed = 4;
      } else if (status === STATUS.SPEAKING) {
        pulseSize = 60 + Math.sin(time * 3) * 15; // Even larger pulse when speaking
        pulseSpeed = 3;
      } else {
        pulseSize = 40 + Math.sin(time * 2) * 5; // Slower, smaller pulse when idle
        pulseSpeed = 2;
      }

      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, pulseSize, 0, Math.PI * 2);
      
      if (status === STATUS.LISTENING) {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.7)";
      } else if (status === STATUS.SPEAKING) {
        ctx.strokeStyle = "rgba(128, 0, 255, 0.7)";
      } else {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
      }
      
      ctx.lineWidth = status === STATUS.IDLE ? 2 : 3;
      ctx.stroke();

      // Second pulsing ring when active
      if (status !== STATUS.IDLE) {
        const pulseSize2 = 70 + Math.sin(time * (pulseSpeed - 1)) * 8;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pulseSize2, 0, Math.PI * 2);
        ctx.strokeStyle = status === STATUS.LISTENING 
          ? "rgba(128, 0, 255, 0.4)" 
          : "rgba(0, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Adjust particle behavior based on status
        let speedMultiplier;
        if (status === STATUS.LISTENING) {
          speedMultiplier = 1.5;
        } else if (status === STATUS.SPEAKING) {
          speedMultiplier = 2;
        } else {
          speedMultiplier = 1;
        }

        particle.x += particle.velocity.x * speedMultiplier;
        particle.y += particle.velocity.y * speedMultiplier;
        particle.life -= 1;

        // Respawn particle if it's dead
        if (particle.life <= 0) {
          particles[index] = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: Math.random() * 2 + 1,
            color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`,
            velocity: {
              x: (Math.random() - 0.5) * 2,
              y: (Math.random() - 0.5) * 2,
            },
            life: Math.random() * 100 + 50,
          };
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 100;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status]);

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-600/10 blur-3xl"></div>
      <canvas ref={canvasRef} width={300} height={300} className="relative z-10" />
    </div>
  );
};

export default AiVisualizer;