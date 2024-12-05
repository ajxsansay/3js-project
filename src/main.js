console.log("Main.js loaded successfully!");

import * as THREE from 'three';

// Scene, Camera, and Renderer
const scene = new THREE.Scene();

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Load Textures
const doorTexture = textureLoader.load('/textures/wood.jpg'); // Load the wood texture for the door
const skyTexture = textureLoader.load('/textures/sky.jpg');
const groundTexture = textureLoader.load('/textures/grassground.jpg');
const wallsTexture = textureLoader.load('/textures/walls.jpg');

// Set Sky Background
scene.background = skyTexture;

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 6, 12);
camera.lookAt(0, 1.25, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Bright ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Directional light
directionalLight.position.set(10, 15, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// House Group
const house = new THREE.Group();
scene.add(house);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ map: groundTexture })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({ map: wallsTexture })
);
walls.position.y = 1.25;
walls.castShadow = true;
walls.receiveShadow = true;
house.add(walls); // Add walls to the house group

// Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1, 4),
  new THREE.MeshStandardMaterial({ color: 0x555555 }) // Gray roof
);
roof.rotation.y = Math.PI / 4;
roof.position.y = 3;
roof.castShadow = true;
house.add(roof);

// Door Texture Fix
doorTexture.wrapS = THREE.RepeatWrapping;
doorTexture.wrapT = THREE.RepeatWrapping;
doorTexture.repeat.set(1, 2); // Adjust this to repeat the texture vertically for the door

// Door Material with Texture
const doorMaterial = new THREE.MeshStandardMaterial({ map: doorTexture });

// Door
const door = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 0.1),
  doorMaterial
);
door.position.y = 1.25;
door.position.z = 2.01; // Ensure it's in front of the house walls
door.castShadow = true;
door.receiveShadow = true;
house.add(door); // Add door to the house group

// Flowers
function createFlower(x, y, z, color) {
  // Stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x228b22 }) // Green stem
  );
  stem.position.set(x, y, z);
  stem.castShadow = true;
  scene.add(stem);

  // Flower center
  const flowerCenter = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshStandardMaterial({ color })
  );
  flowerCenter.position.set(x, y + 0.3, z);
  flowerCenter.castShadow = true;
  scene.add(flowerCenter);

  // Petals
  const petalMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb }); // Light pink
  for (let i = 0; i < 5; i++) {
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      petalMaterial
    );
    const angle = (i / 5) * Math.PI * 2;
    petal.position.set(
      x + Math.cos(angle) * 0.15,
      y + 0.3,
      z + Math.sin(angle) * 0.15
    );
    petal.castShadow = true;
    scene.add(petal);
  }
}

// Create Flowers
for (let i = 0; i < 100; i++) {
  createFlower(
    Math.random() * 15 - 7.5,
    0.3,
    Math.random() * 15 - 7.5,
    0xff69b4 // Pink
  );
}

// Tree
function createTree(x, z) {
  // Tree trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 2),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 }) // Brown trunk
  );
  trunk.position.set(x, 1, z);
  trunk.castShadow = true;
  scene.add(trunk);

  // Tree crown
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x228b22 }) // Green crown
  );
  crown.position.set(x, 2.5, z);
  crown.castShadow = true;
  scene.add(crown);
}

createTree(5, 5);

// Falling Petals System with Larger and Distinctly Colorful Petals
const petalCount = 500; // Number of petals
const petalPositions = new Float32Array(petalCount * 3); // x, y, z for each petal
const petalVelocities = new Float32Array(petalCount * 3); // x, y, z velocities

// Array to store petal meshes
const petals = [];
const distinctColors = [
  0xff007f, // Deep pink (Rose)
  0xff1493, // Hot pink
  0xdc143c, // Crimson
  0xff4500, // Orange red
  0xff6347, // Tomato
  0xff69b4, // Light pink
  0xba55d3, // Orchid
  0x8a2be2, // Blue violet
  0x6a5acd, // Slate blue
  0x9932cc, // Dark orchid
  0xcd5c5c, // Indian red
  0xd2691e, // Chocolate
  0xb22222, // Firebrick
  0x800080, // Purple
  0x8b008b, // Dark magenta
];

// Circular Petal Shape (Using a small sphere scaled flat)
const petalGeometry = new THREE.SphereGeometry(0.15, 8, 8); // Medium size spheres with low segments

for (let i = 0; i < petalCount; i++) {
  // Initial position of petals
  petalPositions[i * 3] = Math.random() * 20 - 10; // x
  petalPositions[i * 3 + 1] = Math.random() * 10 + 5; // y
  petalPositions[i * 3 + 2] = Math.random() * 20 - 10; // z

  // Initial velocity of petals
  petalVelocities[i * 3] = (Math.random() - 0.5) * 0.03; // x velocity
  petalVelocities[i * 3 + 1] = -Math.random() * 0.03; // y velocity
  petalVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03; // z velocity

  // Randomize petal color
  const petalColor = distinctColors[Math.floor(Math.random() * distinctColors.length)];
  const petalMaterial = new THREE.MeshLambertMaterial({
    color: petalColor,
    flatShading: true, // Matte look
  });

  const petal = new THREE.Mesh(petalGeometry, petalMaterial);

  // Scale the petal to make it slightly bigger and still flat
  petal.scale.set(0.25, 0.05, 0.25); // Slightly bigger petals with a thin, flat look

  // Randomize initial rotation
  petal.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  petal.position.set(
    petalPositions[i * 3],
    petalPositions[i * 3 + 1],
    petalPositions[i * 3 + 2]
  );

  petal.castShadow = true;
  petals.push(petal);
  scene.add(petal);
}

// Animation Loop for Falling Petals
function animate() {
  requestAnimationFrame(animate);

  // Update each petal's position
  for (let i = 0; i < petalCount; i++) {
    const petal = petals[i];

    // Update position
    petal.position.x += petalVelocities[i * 3];
    petal.position.y += petalVelocities[i * 3 + 1];
    petal.position.z += petalVelocities[i * 3 + 2];

    // Reset petals when they fall below the ground
    if (petal.position.y < 0) {
      petal.position.set(
        Math.random() * 20 - 10,
        Math.random() * 10 + 5,
        Math.random() * 20 - 10
      );
    }
  }

  // Render the scene
  renderer.render(scene, camera);
}

animate();
