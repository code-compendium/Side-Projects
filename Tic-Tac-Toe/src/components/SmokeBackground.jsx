import { useEffect, useRef } from "react";

class Particle {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.reset();
	}

	reset() {
		this.x = Math.random() * this.width;
		this.y = this.height + Math.random() * 100;
		    this.vx = (Math.random() - 0.5) * 1.0;
    this.vy = -Math.random() * 1.2 - 0.2;
    this.size = Math.random() * 200 + 100;
    this.opacity = Math.random() * 0.4 + 0.1; // Verhoogde opacity
    this.maxLife = Math.random() * 400 + 200;

		this.life = 0;
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;
		this.life++;

		if (this.life >= this.maxLife || this.y < -this.size) {
			this.reset();
		}
	}

	draw(ctx) {
		const currentOpacity = this.opacity * (1 - this.life / this.maxLife);
		ctx.beginPath();
		const gradient = ctx.createRadialGradient(
			this.x,
			this.y,
			0,
			this.x,
			this.y,
			this.size,
		);
		gradient.addColorStop(0, `rgba(140, 140, 140, ${currentOpacity})`);
		gradient.addColorStop(0.5, `rgba(80, 80, 80, ${currentOpacity * 0.4})`);
		gradient.addColorStop(1, `rgba(40, 40, 40, 0)`);

		ctx.fillStyle = gradient;
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.fill();
	}
}

const SmokeBackground = () => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		let animationFrameId;

		let width, height;
		let particles = [];

		const resize = () => {
			width = canvas.width = window.innerWidth;
			height = canvas.height = window.innerHeight;
			init();
		};

		window.addEventListener("resize", resize);
		resize();

		function init() {
			particles = [];
			for (let i = 0; i < 50; i++) { // Meer deeltjes
				particles.push(new Particle(width, height));
			}
		}

		init();

		const animate = () => {
			ctx.clearRect(0, 0, width, height);

			particles.forEach((p) => {
				p.update();
				p.draw(ctx); // Pass ctx here
			});

			animationFrameId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", resize);
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				zIndex: -1,
				pointerEvents: "none",
				background: "transparent",
			}}
		/>
	);
};

export default SmokeBackground;
