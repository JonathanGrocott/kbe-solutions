// Interactive 3D Knowledge Graph with Three.js
class KnowledgeGraph {
    constructor(canvasId) {
        this.container = document.getElementById(canvasId);
        if (!this.container) {
            console.error(`Container element with id '${canvasId}' not found`);
            return;
        }
        
        console.log('Initializing Three.js Knowledge Graph...');
        console.log('THREE object:', typeof THREE !== 'undefined' ? 'loaded' : 'not loaded');
        
        this.nodes = [];
        this.connections = [];
        this.nodeMeshes = [];
        this.connectionLines = [];
        this.particles = [];
        this.particleMeshes = [];
        this.time = 0;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.hoveredNode = null;
        this.isDragging = false;
        
        // Dark theme color palette
        this.colors = {
            nodes: [
                0x6366f1, // Indigo
                0x0ea5e9, // Sky blue  
                0x10b981, // Emerald
                0xf59e0b, // Amber
                0xef4444, // Red
                0x8b5cf6, // Purple
                0xec4899, // Pink
                0x14b8a6  // Teal
            ],
            connections: 0x94a3b8,
            particles: 0x818cf8,
            background: 0x131318
        };
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.colors.background);
        
        // Get container dimensions
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight || 500;
        const size = Math.min(containerWidth, containerHeight, 500);
        
        console.log('Container dimensions:', containerWidth, 'x', containerHeight);
        console.log('Canvas size:', size);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.camera.position.z = 300;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(size, size);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        console.log('Renderer created and appended to container');
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);
        
        // Add point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0x6366f1, 1, 200);
        pointLight1.position.set(50, 50, 50);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x0ea5e9, 1, 200);
        pointLight2.position.set(-50, -50, 50);
        this.scene.add(pointLight2);
        
        this.createNodes();
        this.createConnections();
        this.createParticles();
        
        console.log('Graph initialized:', this.nodes.length, 'nodes,', this.connections.length, 'connections');
    }
    
    createNodes() {
        const nodeCount = 25;
        const radius = 150;
        
        for (let i = 0; i < nodeCount; i++) {
            // Distribute nodes in 3D space
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * (0.3 + Math.random() * 0.7);
            
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            
            // Vary node sizes
            const sizeCategory = Math.random();
            let nodeRadius;
            if (sizeCategory < 0.6) {
                nodeRadius = 3 + Math.random() * 3;
            } else if (sizeCategory < 0.85) {
                nodeRadius = 6 + Math.random() * 4;
            } else {
                nodeRadius = 10 + Math.random() * 5;
            }
            
            const color = this.colors.nodes[i % this.colors.nodes.length];
            
            // Create sphere geometry with more segments for smoother appearance
            const geometry = new THREE.SphereGeometry(nodeRadius, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.2,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            
            // Store original position and other data
            mesh.userData = {
                basePosition: { x, y, z },
                baseRadius: nodeRadius,
                color: color,
                pulseOffset: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.001,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                )
            };
            
            this.scene.add(mesh);
            this.nodeMeshes.push(mesh);
            
            this.nodes.push({
                position: new THREE.Vector3(x, y, z),
                radius: nodeRadius,
                mesh: mesh
            });
        }
    }
    
    createConnections() {
        // Create connections based on proximity
        this.nodes.forEach((node, i) => {
            const connectionCount = Math.floor(node.radius / 2);
            
            // Find closest nodes
            const distances = this.nodes.map((other, j) => {
                if (i === j) return { index: j, distance: Infinity };
                const distance = node.position.distanceTo(other.position);
                return { index: j, distance };
            });
            
            distances.sort((a, b) => a.distance - b.distance);
            
            // Connect to closest nodes
            for (let c = 0; c < Math.min(connectionCount, 5); c++) {
                const targetIdx = distances[c].index;
                
                // Check if connection already exists
                const exists = this.connections.some(conn => 
                    (conn.from === i && conn.to === targetIdx) ||
                    (conn.from === targetIdx && conn.to === i)
                );
                
                if (!exists) {
                    this.connections.push({
                        from: i,
                        to: targetIdx,
                        strength: 0.1 + Math.random() * 0.3,
                        particleSpeed: 0.002 + Math.random() * 0.005
                    });
                    
                    // Create line geometry
                    const points = [
                        this.nodes[i].position.clone(),
                        this.nodes[targetIdx].position.clone()
                    ];
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: this.colors.connections,
                        transparent: true,
                        opacity: 0.3
                    });
                    
                    const line = new THREE.Line(geometry, material);
                    line.userData = { from: i, to: targetIdx };
                    this.scene.add(line);
                    this.connectionLines.push(line);
                }
            }
        });
    }
    
    createParticles() {
        // Create particles that move along connections
        this.connections.forEach((conn, idx) => {
            const particleCount = Math.random() > 0.5 ? 1 : 2;
            
            for (let i = 0; i < particleCount; i++) {
                const geometry = new THREE.SphereGeometry(1.2, 16, 16);
                const material = new THREE.MeshBasicMaterial({
                    color: this.colors.particles,
                    transparent: true,
                    opacity: 0.8
                });
                
                const particle = new THREE.Mesh(geometry, material);
                particle.userData = {
                    connectionIdx: idx,
                    progress: Math.random(),
                    speed: conn.particleSpeed
                };
                
                this.scene.add(particle);
                this.particleMeshes.push(particle);
            }
        });
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.renderer.domElement.addEventListener('mouseup', () => this.onMouseUp());
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
        
        // Touch support
        this.renderer.domElement.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.onMouseMove(touch);
            this.onMouseDown(touch);
        });
        this.renderer.domElement.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.onMouseMove(touch);
        });
        this.renderer.domElement.addEventListener('touchend', () => this.onMouseUp());
    }
    
    onWindowResize() {
        const size = Math.min(this.container.clientWidth, 500);
        this.camera.aspect = 1;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(size, size);
    }
    
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
        
        // Handle hover effects
        if (this.hoveredNode) {
            this.hoveredNode.material.emissiveIntensity = 0.2;
            this.renderer.domElement.style.cursor = 'grab';
        }
        
        if (intersects.length > 0) {
            this.hoveredNode = intersects[0].object;
            this.hoveredNode.material.emissiveIntensity = 0.5;
            this.renderer.domElement.style.cursor = 'pointer';
        } else {
            this.hoveredNode = null;
        }
    }
    
    onMouseDown(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
        
        if (intersects.length > 0) {
            this.isDragging = true;
            this.renderer.domElement.style.cursor = 'grabbing';
        }
    }
    
    onMouseUp() {
        this.isDragging = false;
        this.renderer.domElement.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
    }
    
    onClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
        
        if (intersects.length > 0) {
            const clickedNode = intersects[0].object;
            // Pulse animation on click
            this.pulseNode(clickedNode);
        }
    }
    
    pulseNode(node) {
        const originalScale = node.scale.x;
        const targetScale = originalScale * 1.5;
        const duration = 500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            const scale = originalScale + (targetScale - originalScale) * Math.sin(eased * Math.PI);
            
            node.scale.set(scale, scale, scale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                node.scale.set(originalScale, originalScale, originalScale);
            }
        };
        
        animate();
    }
    
    updateNodes() {
        this.nodeMeshes.forEach((mesh, idx) => {
            const data = mesh.userData;
            
            // Gentle floating motion
            const floatX = Math.sin(this.time * 0.0008 + data.pulseOffset) * 2;
            const floatY = Math.cos(this.time * 0.0006 + data.pulseOffset) * 2;
            const floatZ = Math.sin(this.time * 0.0007 + data.pulseOffset) * 2;
            
            mesh.position.x = data.basePosition.x + floatX;
            mesh.position.y = data.basePosition.y + floatY;
            mesh.position.z = data.basePosition.z + floatZ;
            
            // Subtle rotation
            mesh.rotation.x += data.rotationSpeed;
            mesh.rotation.y += data.rotationSpeed * 1.3;
            
            // Subtle size pulsing
            const pulse = 1 + Math.sin(this.time * 0.0015 + data.pulseOffset) * 0.1;
            if (!this.isDragging || mesh !== this.hoveredNode) {
                mesh.scale.set(pulse, pulse, pulse);
            }
            
            // Update node position in nodes array
            this.nodes[idx].position.copy(mesh.position);
        });
    }
    
    updateConnections() {
        this.connectionLines.forEach(line => {
            const from = this.nodes[line.userData.from].position;
            const to = this.nodes[line.userData.to].position;
            
            const positions = line.geometry.attributes.position;
            positions.setXYZ(0, from.x, from.y, from.z);
            positions.setXYZ(1, to.x, to.y, to.z);
            positions.needsUpdate = true;
        });
    }
    
    updateParticles() {
        this.particleMeshes.forEach(particle => {
            const data = particle.userData;
            data.progress += data.speed;
            
            if (data.progress > 1) {
                data.progress = 0;
            }
            
            const conn = this.connections[data.connectionIdx];
            const from = this.nodes[conn.from].position;
            const to = this.nodes[conn.to].position;
            
            // Interpolate position along connection
            particle.position.lerpVectors(from, to, data.progress);
            
            // Add slight glow effect
            particle.material.opacity = 0.6 + Math.sin(this.time * 0.005) * 0.2;
        });
    }
    
    animate() {
        this.time = Date.now();
        
        // Auto-rotate the entire scene for dynamic feel
        this.scene.rotation.y += 0.0005;
        
        this.updateNodes();
        this.updateConnections();
        this.updateParticles();
        
        this.renderer.render(this.scene, this.camera);
        
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        // Clean up Three.js resources
        this.nodeMeshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        
        this.connectionLines.forEach(line => {
            line.geometry.dispose();
            line.material.dispose();
        });
        
        this.particleMeshes.forEach(particle => {
            particle.geometry.dispose();
            particle.material.dispose();
        });
        
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}

// Initialize graph when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const graph = new KnowledgeGraph('knowledge-graph');
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        graph.destroy();
    });
});
