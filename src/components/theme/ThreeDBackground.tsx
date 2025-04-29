
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

export const ThreeDBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { is3DMode, theme } = useTheme();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!is3DMode || !containerRef.current) return;

    // Set up scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add shapes - floating particles or shapes based on theme
    const particlesCount = 200;
    const particles = new THREE.Group();
    scene.add(particles);

    const isDarkMode = theme === "dark";
    
    // Different color and opacity settings for each theme
    const particleColor = isDarkMode ? 0x5b7eb5 : 0x33c3f0;
    const particleOpacityBase = isDarkMode ? 0.2 : 0.3;
    const particleOpacityVariation = isDarkMode ? 0.5 : 0.4;

    // Different shapes for each theme
    for (let i = 0; i < particlesCount; i++) {
      let geometry;
      
      if (isDarkMode) {
        // Spheres for dark mode
        geometry = new THREE.SphereGeometry(0.05, 8, 8);
      } else {
        // Mixed shapes for light mode
        const shapeType = Math.floor(Math.random() * 3);
        if (shapeType === 0) {
          // Small cubes
          geometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        } else if (shapeType === 1) {
          // Tiny tetrahedrons
          geometry = new THREE.TetrahedronGeometry(0.06);
        } else {
          // Flat circles
          geometry = new THREE.CircleGeometry(0.05, 16);
        }
      }
      
      const material = new THREE.MeshBasicMaterial({
        color: particleColor,
        transparent: true,
        opacity: Math.random() * particleOpacityVariation + particleOpacityBase,
      });
      const particle = new THREE.Mesh(geometry, material);

      // Random positions throughout the scene
      particle.position.x = Math.random() * 20 - 10;
      particle.position.y = Math.random() * 20 - 10;
      particle.position.z = Math.random() * 20 - 10;

      // Different movement patterns for each theme
      const speedFactor = isDarkMode ? 0.01 : 0.015;
      
      // Add custom properties for animation
      particle.userData = {
        speed: Math.random() * speedFactor,
        direction: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
        rotation: isDarkMode ? 0 : Math.random() * 0.02, // Add rotation for light mode
      };

      particles.add(particle);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      if (!is3DMode) return;
      
      const animationId = requestAnimationFrame(animate);

      // Animate particles
      particles.children.forEach((particle) => {
        const { speed, direction, rotation } = particle.userData;
        
        // Move particles
        particle.position.x += direction.x * speed;
        particle.position.y += direction.y * speed;
        particle.position.z += direction.z * speed;

        // Add rotation for light mode particles
        if (!isDarkMode && rotation) {
          particle.rotation.x += rotation;
          particle.rotation.y += rotation;
        }

        // Reset particles that go too far
        if (
          Math.abs(particle.position.x) > 10 ||
          Math.abs(particle.position.y) > 10 ||
          Math.abs(particle.position.z) > 10
        ) {
          // Bring back from the opposite direction
          particle.position.x = Math.sign(particle.position.x) * -10;
          particle.position.y = Math.sign(particle.position.y) * -10;
          particle.position.z = Math.sign(particle.position.z) * -10;
        }
      });

      // Different overall movement for each theme
      if (isDarkMode) {
        // Slow rotation of the entire particle system for dark mode
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0002;
      } else {
        // Gentle wave effect for light mode
        const time = Date.now() * 0.001;
        particles.rotation.y += 0.0008;
        particles.position.y = Math.sin(time * 0.5) * 0.2;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }

      return () => {
        cancelAnimationFrame(animationId);
      };
    };

    animate();

    // Cleanup
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [is3DMode, theme]);

  // Update the scene when theme changes
  useEffect(() => {
    if (!is3DMode || !sceneRef.current) return;

    const isDarkMode = theme === "dark";
    const particleColor = isDarkMode ? 0x5b7eb5 : 0x33c3f0;

    sceneRef.current.children.forEach((child) => {
      if (child instanceof THREE.Group) {
        child.children.forEach((particle) => {
          if (particle instanceof THREE.Mesh) {
            const material = particle.material as THREE.MeshBasicMaterial;
            material.color.set(particleColor);
          }
        });
      }
    });
  }, [theme, is3DMode]);

  if (!is3DMode) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
