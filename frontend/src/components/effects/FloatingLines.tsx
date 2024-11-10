import { useEffect, useRef, useCallback } from 'react';

export const FloatingLines = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    interface Dot {
      x: number;
      y: number;
      vx: number;
      vy: number;
      network: 'left' | 'right';
    }
    
    const dots: Dot[] = [];
    const numDotsPerNetwork = 25;
    const centerAvoidanceRadius = 400;
    const connectionDistance = 350;
    const minConnections = 2;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createDots = () => {
      // Create left network
      for (let i = 0; i < numDotsPerNetwork; i++) {
        const x = Math.random() * (canvas.width * 0.45);
        const y = Math.random() * canvas.height;
        
        dots.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          network: 'left'
        });
      }

      // Create right network
      for (let i = 0; i < numDotsPerNetwork; i++) {
        const x = canvas.width - (Math.random() * (canvas.width * 0.45));
        const y = Math.random() * canvas.height;
        
        dots.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          network: 'right'
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw all possible connections first
      dots.forEach((dot, i) => {
        dots.forEach((otherDot, j) => {
          if (i !== j && dot.network === otherDot.network) {
            const distance = Math.hypot(dot.x - otherDot.x, dot.y - otherDot.y);
            if (distance < connectionDistance) {
              // Dynamic opacity based on distance and number of connections
              const opacity = (1 - distance / connectionDistance) * 0.3;
              const gradient = ctx.createLinearGradient(dot.x, dot.y, otherDot.x, otherDot.y);
              
              if (dot.network === 'left') {
                gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity})`); // Blue
                gradient.addColorStop(1, `rgba(147, 51, 234, ${opacity})`); // Purple
              } else {
                gradient.addColorStop(0, `rgba(147, 51, 234, ${opacity})`); // Purple
                gradient.addColorStop(1, `rgba(59, 130, 246, ${opacity})`); // Blue
              }
              
              ctx.beginPath();
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1.5;
              ctx.moveTo(dot.x, dot.y);
              ctx.lineTo(otherDot.x, otherDot.y);
              ctx.stroke();
            }
          }
        });

        // Update positions with boundary checks
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Keep dots in their respective sides with smooth bounce
        if (dot.network === 'left') {
          if (dot.x < 0) {
            dot.x = 0;
            dot.vx *= -1;
          } else if (dot.x > canvas.width * 0.45) {
            dot.x = canvas.width * 0.45;
            dot.vx *= -1;
          }
        } else {
          if (dot.x < canvas.width * 0.55) {
            dot.x = canvas.width * 0.55;
            dot.vx *= -1;
          } else if (dot.x > canvas.width) {
            dot.x = canvas.width;
            dot.vx *= -1;
          }
        }
        
        if (dot.y < 0) {
          dot.y = 0;
          dot.vy *= -1;
        } else if (dot.y > canvas.height) {
          dot.y = canvas.height;
          dot.vy *= -1;
        }
      });

      // Draw dots with subtle glow effect
      dots.forEach(dot => {
        // Outer glow
        const glowGradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 8);
        glowGradient.addColorStop(0, `rgba(${dot.network === 'left' ? '59, 130, 246' : '147, 51, 234'}, 0.2)`);
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.fillStyle = glowGradient;
        ctx.arc(dot.x, dot.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 3);
        gradient.addColorStop(0, `rgba(${dot.network === 'left' ? '59, 130, 246' : '147, 51, 234'}, 0.8)`);
        gradient.addColorStop(1, `rgba(${dot.network === 'left' ? '147, 51, 234' : '59, 130, 246'}, 0.8)`);
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    setCanvasSize();
    createDots();
    draw();

    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    animate();
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}; 