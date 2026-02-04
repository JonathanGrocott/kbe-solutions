// Futuristic Context Graph Visualization (Three.js)
class KnowledgeGraph {
    constructor(canvasId, options = {}) {
        this.container = document.getElementById(canvasId);
        if (!this.container) {
            console.error(`Container element with id '${canvasId}' not found`);
            return;
        }

        this.options = {
            mode: 'background',
            pointerEvents: 'none',
            ...options
        };
        this.settings = this.getSettings(this.options.mode);

        this.nodes = [];
        this.connections = [];
        this.nodeMeshes = [];
        this.connectionLines = [];
        this.decisionLines = [];
        this.particleMeshes = [];
        this.labelSprites = [];
        this.rings = [];
        this.glowSprites = [];
        this.decisionBursts = [];
        this.gridPlanes = [];
        this.scanMeshes = [];
        this.time = 0;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.hoveredNode = null;
        this.isDragging = false;

        this.colors = {
            hub: 0x20d6c7,
            cluster: 0x6ea8ff,
            peripheral: 0xf6b35b,
            bridge: 0x8ef6ff,
            connections: 0x5b6c85,
            decision: 0x20d6c7,
            particles: 0x8ef6ff,
            rings: 0x20d6c7,
            scan: 0x6ea8ff
        };

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    getSettings(mode) {
        if (mode === 'hero') {
            return {
                starCount: 900,
                clusterCount: 5,
                nodesPerCluster: 10,
                clusterRadius: 95,
                clusterSpread: 60,
                peripheralCount: 20,
                peripheralRadius: 210,
                bridgeCount: 10,
                bridgeRadius: 150,
                randomConnectionRate: 0.3,
                labelCount: 12,
                labelOpacity: 0.78,
                showGrid: true,
                showScan: true,
                showDecisionBursts: true,
                sceneRotation: 0.00038,
                cameraDrift: true
            };
        }

        return {
            starCount: 700,
            clusterCount: 4,
            nodesPerCluster: 8,
            clusterRadius: 85,
            clusterSpread: 50,
            peripheralCount: 14,
            peripheralRadius: 190,
            bridgeCount: 8,
            bridgeRadius: 135,
            randomConnectionRate: 0.2,
            labelCount: 8,
            labelOpacity: 0.55,
            showGrid: true,
            showScan: true,
            showDecisionBursts: true,
            sceneRotation: 0.00022,
            cameraDrift: false
        };
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = null;

        const containerWidth = this.container.clientWidth || window.innerWidth;
        const containerHeight = this.container.clientHeight || window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(70, containerWidth / containerHeight, 0.1, 1400);
        this.camera.position.z = 420;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.domElement.style.pointerEvents = this.options.pointerEvents;
        this.container.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        const pointLight1 = new THREE.PointLight(this.colors.hub, 1, 240);
        pointLight1.position.set(60, 40, 40);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(this.colors.cluster, 0.9, 240);
        pointLight2.position.set(-50, -40, 60);
        this.scene.add(pointLight2);

        this.createBackgroundField();
        this.createRings();
        if (this.settings.showGrid) {
            this.createGridPlanes();
        }
        this.createNodes();
        this.createConnections();
        this.createParticles();
        this.createLabels();
        if (this.settings.showScan) {
            this.createScanSweep();
        }
        if (this.settings.showDecisionBursts) {
            this.createDecisionBursts();
        }
    }

    createBackgroundField() {
        const starCount = this.settings.starCount;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 900;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 900;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 900;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.2,
            opacity: 0.35,
            transparent: true
        });

        const points = new THREE.Points(geometry, material);
        points.userData = { drift: (Math.random() - 0.5) * 0.0003 };
        this.scene.add(points);
        this.rings.push(points);
    }

    createRings() {
        const ringConfigs = [
            { radius: 120, tube: 0.6, opacity: 0.2 },
            { radius: 165, tube: 0.5, opacity: 0.14 },
            { radius: 210, tube: 0.4, opacity: 0.1 }
        ];

        ringConfigs.forEach((config, index) => {
            const geometry = new THREE.TorusGeometry(config.radius, config.tube, 16, 140);
            const material = new THREE.MeshBasicMaterial({
                color: this.colors.rings,
                transparent: true,
                opacity: config.opacity,
                blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2.4 + index * 0.3;
            ring.rotation.y = index * 0.6;
            ring.userData = { spin: (index + 1) * 0.0003 };
            this.scene.add(ring);
            this.rings.push(ring);
        });

        const planeGeometry = new THREE.RingGeometry(70, 160, 64);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x6ea8ff,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = Math.PI / 2.1;
        plane.userData = { spin: -0.0002 };
        this.scene.add(plane);
        this.rings.push(plane);
    }

    createGridPlanes() {
        const grid = new THREE.GridHelper(700, 40, 0x6ea8ff, 0x1b2a3f);
        if (Array.isArray(grid.material)) {
            grid.material.forEach(material => {
                material.opacity = 0.12;
                material.transparent = true;
            });
        } else {
            grid.material.opacity = 0.12;
            grid.material.transparent = true;
        }
        grid.rotation.x = Math.PI / 2.15;
        grid.position.y = -40;
        grid.userData = { spin: 0.00012 };
        this.scene.add(grid);
        this.gridPlanes.push(grid);

        const grid2 = new THREE.GridHelper(500, 24, 0x20d6c7, 0x132030);
        if (Array.isArray(grid2.material)) {
            grid2.material.forEach(material => {
                material.opacity = 0.08;
                material.transparent = true;
            });
        } else {
            grid2.material.opacity = 0.08;
            grid2.material.transparent = true;
        }
        grid2.rotation.x = Math.PI / 1.85;
        grid2.rotation.z = Math.PI / 4.5;
        grid2.position.y = 60;
        grid2.userData = { spin: -0.0001 };
        this.scene.add(grid2);
        this.gridPlanes.push(grid2);
    }

    createNodes() {
        const clusterCount = this.settings.clusterCount;
        const nodesPerCluster = this.settings.nodesPerCluster;
        const clusterRadius = this.settings.clusterRadius;
        const clusterSpread = this.settings.clusterSpread;

        const corePosition = new THREE.Vector3(0, 0, 0);
        const coreRadius = 16;
        const coreMesh = this.createNodeMesh(corePosition, coreRadius, this.colors.hub, true);
        this.nodes.push({ position: corePosition.clone(), radius: coreRadius, mesh: coreMesh, clusterId: -3, type: 'core' });
        this.createGlow(coreMesh, coreRadius * 3.2, 0.45);

        const haloGeometry = new THREE.SphereGeometry(coreRadius * 1.8, 32, 32);
        const haloMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.hub,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending
        });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.position.copy(corePosition);
        this.scene.add(halo);
        this.rings.push(halo);

        for (let c = 0; c < clusterCount; c++) {
            const theta = (c / clusterCount) * Math.PI * 2 + Math.random() * 0.3;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = clusterRadius;

            const center = new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );

            const hubRadius = 12 + Math.random() * 4;
            const hubMesh = this.createNodeMesh(center, hubRadius, this.colors.hub, true);
            this.nodes.push({ position: center.clone(), radius: hubRadius, mesh: hubMesh, clusterId: c, type: 'hub' });
            this.createGlow(hubMesh, hubRadius * 2.6, 0.35);

            for (let i = 0; i < nodesPerCluster; i++) {
                const offset = new THREE.Vector3(
                    (Math.random() - 0.5) * clusterSpread,
                    (Math.random() - 0.5) * clusterSpread,
                    (Math.random() - 0.5) * clusterSpread
                );
                const nodePos = center.clone().add(offset);
                const nodeRadius = 4 + Math.random() * 5;
                const nodeMesh = this.createNodeMesh(nodePos, nodeRadius, this.colors.cluster);
                this.nodes.push({ position: nodePos.clone(), radius: nodeRadius, mesh: nodeMesh, clusterId: c, type: 'cluster' });
            }
        }

        const peripheralCount = this.settings.peripheralCount;
        const peripheralRadius = this.settings.peripheralRadius;
        for (let i = 0; i < peripheralCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = peripheralRadius + (Math.random() - 0.5) * 20;
            const pos = new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );
            const nodeRadius = 3 + Math.random() * 4;
            const nodeMesh = this.createNodeMesh(pos, nodeRadius, this.colors.peripheral);
            this.nodes.push({ position: pos.clone(), radius: nodeRadius, mesh: nodeMesh, clusterId: -1, type: 'peripheral' });
        }

        const bridgeCount = this.settings.bridgeCount;
        const bridgeRadius = this.settings.bridgeRadius;
        for (let i = 0; i < bridgeCount; i++) {
            const angle = (i / bridgeCount) * Math.PI * 2;
            const pos = new THREE.Vector3(
                Math.cos(angle) * bridgeRadius,
                (Math.random() - 0.5) * 40,
                Math.sin(angle) * bridgeRadius
            );
            const nodeRadius = 5 + Math.random() * 4;
            const nodeMesh = this.createNodeMesh(pos, nodeRadius, this.colors.bridge);
            this.nodes.push({ position: pos.clone(), radius: nodeRadius, mesh: nodeMesh, clusterId: -2, type: 'bridge' });
        }
    }

    createNodeMesh(position, radius, color, isHub = false) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: isHub ? 0.6 : 0.25,
            shininess: 120,
            transparent: true,
            opacity: 0.92
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);

        mesh.userData = {
            basePosition: position.clone(),
            baseRadius: radius,
            color: color,
            pulseOffset: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.0012,
            isHub
        };

        this.scene.add(mesh);
        this.nodeMeshes.push(mesh);
        return mesh;
    }

    createConnections() {
        const addConnection = (from, to, strength = 0.15, speed = 0.003) => {
            if (from === to) return;
            const exists = this.connections.some(conn =>
                (conn.from === from && conn.to === to) ||
                (conn.from === to && conn.to === from)
            );
            if (exists) return;

            const isDecision = strength >= 0.2;
            this.connections.push({
                from,
                to,
                strength,
                particleSpeed: speed,
                isDecision
            });

            const points = [
                this.nodes[from].position.clone(),
                this.nodes[to].position.clone()
            ];

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: this.colors.connections,
                transparent: true,
                opacity: 0.22,
                blending: THREE.AdditiveBlending
            });

            const line = new THREE.Line(geometry, material);
            line.userData = { from, to, baseOpacity: 0.22 };
            this.scene.add(line);
            this.connectionLines.push(line);

            if (isDecision) {
                const decisionMaterial = new THREE.LineBasicMaterial({
                    color: this.colors.decision,
                    transparent: true,
                    opacity: 0.6,
                    blending: THREE.AdditiveBlending
                });
                const decisionLine = new THREE.Line(geometry.clone(), decisionMaterial);
                decisionLine.userData = { from, to, baseOpacity: 0.6 };
                this.scene.add(decisionLine);
                this.decisionLines.push(decisionLine);
            }
        };

        const coreNode = this.nodes.find(node => node.type === 'core');
        const hubs = this.nodes.filter(node => node.type === 'hub');
        const clusterNodes = this.nodes.filter(node => node.type === 'cluster');
        const peripheralNodes = this.nodes.filter(node => node.type === 'peripheral');
        const bridgeNodes = this.nodes.filter(node => node.type === 'bridge');

        if (coreNode) {
            const coreIndex = this.nodes.indexOf(coreNode);
            hubs.forEach(hub => addConnection(coreIndex, this.nodes.indexOf(hub), 0.3, 0.005));
            bridgeNodes.forEach(bridge => addConnection(coreIndex, this.nodes.indexOf(bridge), 0.2, 0.004));
        }

        hubs.forEach((hub, hubIndex) => {
            const hubGlobalIndex = this.nodes.indexOf(hub);
            const clusterMembers = this.nodes.filter(node => node.clusterId === hub.clusterId && node.type === 'cluster');
            clusterMembers.forEach(member => {
                const memberIndex = this.nodes.indexOf(member);
                addConnection(hubGlobalIndex, memberIndex, 0.2, 0.004);
            });

            const nextHub = hubs[(hubIndex + 1) % hubs.length];
            addConnection(hubGlobalIndex, this.nodes.indexOf(nextHub), 0.25, 0.005);

            const skipHub = hubs[(hubIndex + 2) % hubs.length];
            addConnection(hubGlobalIndex, this.nodes.indexOf(skipHub), 0.18, 0.004);
        });

        clusterNodes.forEach(node => {
            const nodeIndex = this.nodes.indexOf(node);
            const sameCluster = clusterNodes.filter(n => n.clusterId === node.clusterId && n !== node);
            const distances = sameCluster
                .map(other => ({ index: this.nodes.indexOf(other), distance: node.position.distanceTo(other.position) }))
                .sort((a, b) => a.distance - b.distance);
            distances.slice(0, 3).forEach(item => addConnection(nodeIndex, item.index, 0.12, 0.003));
        });

        peripheralNodes.forEach(node => {
            const nodeIndex = this.nodes.indexOf(node);
            const nearestHub = hubs
                .map(hub => ({ index: this.nodes.indexOf(hub), distance: node.position.distanceTo(hub.position) }))
                .sort((a, b) => a.distance - b.distance)[0];
            addConnection(nodeIndex, nearestHub.index, 0.15, 0.003);

            const nearestBridge = bridgeNodes
                .map(bridge => ({ index: this.nodes.indexOf(bridge), distance: node.position.distanceTo(bridge.position) }))
                .sort((a, b) => a.distance - b.distance)[0];
            if (nearestBridge) {
                addConnection(nodeIndex, nearestBridge.index, 0.12, 0.003);
            }
        });

        bridgeNodes.forEach(node => {
            const nodeIndex = this.nodes.indexOf(node);
            const nearestCluster = clusterNodes
                .map(other => ({ index: this.nodes.indexOf(other), distance: node.position.distanceTo(other.position) }))
                .sort((a, b) => a.distance - b.distance)[0];
            addConnection(nodeIndex, nearestCluster.index, 0.18, 0.004);
        });

        this.nodes.forEach((node, index) => {
            if (Math.random() < this.settings.randomConnectionRate) {
                const targetIndex = Math.floor(Math.random() * this.nodes.length);
                addConnection(index, targetIndex, 0.1, 0.0025);
            }
        });
    }

    createParticles() {
        this.connections.forEach((conn, idx) => {
            const particleCount = conn.isDecision ? 3 : (Math.random() > 0.4 ? 1 : 2);

            for (let i = 0; i < particleCount; i++) {
                const size = conn.isDecision ? 2.2 : 1.4;
                const geometry = new THREE.SphereGeometry(size, 16, 16);
                const material = new THREE.MeshBasicMaterial({
                    color: conn.isDecision ? this.colors.decision : this.colors.particles,
                    transparent: true,
                    opacity: conn.isDecision ? 0.95 : 0.85
                });

                const particle = new THREE.Mesh(geometry, material);
                particle.userData = {
                    connectionIdx: idx,
                    progress: Math.random(),
                    speed: conn.particleSpeed * (conn.isDecision ? 1.4 : 1),
                    isDecision: conn.isDecision,
                    baseScale: particle.scale.clone(),
                    pulseOffset: Math.random() * Math.PI * 2
                };

                this.scene.add(particle);
                this.particleMeshes.push(particle);
            }
        });
    }

    createGlow(targetMesh, scale, opacity) {
        const texture = this.createGlowTexture();
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(scale, scale, 1);
        sprite.position.copy(targetMesh.position);
        sprite.userData = { target: targetMesh, baseScale: scale, baseOpacity: opacity, drift: Math.random() * Math.PI * 2 };
        this.scene.add(sprite);
        this.glowSprites.push(sprite);
    }

    createGlowTexture() {
        if (this.glowTexture) return this.glowTexture;
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(32, 214, 199, 0.7)');
        gradient.addColorStop(0.5, 'rgba(32, 214, 199, 0.25)');
        gradient.addColorStop(1, 'rgba(32, 214, 199, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 128, 128);
        this.glowTexture = new THREE.CanvasTexture(canvas);
        this.glowTexture.minFilter = THREE.LinearFilter;
        return this.glowTexture;
    }

    createLabels() {
        const labelPool = [
            'MES', 'QMS', 'CAPA', 'PLM', 'ERP', 'SCADA', 'EAM', 'MRP',
            'Deviation', 'Change Control', 'Maintenance', 'Audit',
            'Supplier', 'NCR', 'Work Instructions'
        ];

        const candidateNodes = this.nodes.filter(node =>
            node.type === 'hub' || node.type === 'bridge' || node.type === 'peripheral'
        );

        const maxLabels = Math.min(labelPool.length, this.settings.labelCount);
        for (let i = 0; i < maxLabels; i++) {
            const node = candidateNodes[i % candidateNodes.length];
            const nodeIndex = this.nodes.indexOf(node);
            const label = labelPool[i];
            const sprite = this.createLabelSprite(label, 0x8ef6ff, this.settings.labelOpacity);

            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 24,
                16 + Math.random() * 18,
                (Math.random() - 0.5) * 24
            );

            sprite.position.copy(node.position.clone().add(offset));
            this.scene.add(sprite);
            this.labelSprites.push({ sprite, nodeIndex, offset, drift: Math.random() * Math.PI * 2 });
        }
    }

    createLabelSprite(text, color, opacity = 0.8) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = 32;
        const paddingX = 20;
        const paddingY = 14;

        context.font = `600 ${fontSize}px \"Space Grotesk\", sans-serif`;
        const textWidth = context.measureText(text).width;
        const width = Math.ceil(textWidth + paddingX * 2);
        const height = fontSize + paddingY * 2;

        canvas.width = width;
        canvas.height = height;

        context.font = `600 ${fontSize}px \"Space Grotesk\", sans-serif`;
        context.textBaseline = 'middle';

        const radius = 14;
        context.fillStyle = 'rgba(8, 16, 24, 0.55)';
        context.strokeStyle = 'rgba(110, 168, 255, 0.35)';
        context.lineWidth = 2;
        this.drawRoundedRect(context, 1, 1, width - 2, height - 2, radius);
        context.fill();
        context.stroke();

        context.fillStyle = `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, 0.92)`;
        context.fillText(text, paddingX, height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity,
            depthWrite: false,
            depthTest: false
        });

        const sprite = new THREE.Sprite(material);
        const scale = 0.25;
        sprite.scale.set(width * scale, height * scale, 1);
        sprite.userData = { baseScale: sprite.scale.clone() };
        return sprite;
    }

    drawRoundedRect(context, x, y, width, height, radius) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
    }

    createScanSweep() {
        const ringGeometry = new THREE.RingGeometry(160, 210, 96);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.scan,
            transparent: true,
            opacity: 0.14,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: false
        });
        const scanRing = new THREE.Mesh(ringGeometry, ringMaterial);
        scanRing.rotation.x = Math.PI / 2.05;
        scanRing.userData = { type: 'ring', speed: 0.00022, phase: Math.random() };
        this.scene.add(scanRing);
        this.scanMeshes.push(scanRing);

        const beamGeometry = new THREE.PlaneGeometry(520, 90);
        const beamTexture = this.createBeamTexture();
        const beamMaterial = new THREE.MeshBasicMaterial({
            map: beamTexture,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: false
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.rotation.x = Math.PI / 2.2;
        beam.userData = { type: 'beam', speed: 0.00045 };
        this.scene.add(beam);
        this.scanMeshes.push(beam);
    }

    createBeamTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'rgba(32, 214, 199, 0)');
        gradient.addColorStop(0.5, 'rgba(110, 168, 255, 0.45)');
        gradient.addColorStop(1, 'rgba(32, 214, 199, 0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'rgba(110, 168, 255, 0.3)';
        context.fillRect(canvas.width / 2 - 2, 0, 4, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        return texture;
    }

    createDecisionBursts() {
        for (let i = 0; i < 3; i++) {
            const burstGeometry = new THREE.RingGeometry(18, 22, 64);
            const material = new THREE.MeshBasicMaterial({
                color: this.colors.decision,
                transparent: true,
                opacity: 0.25,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: false
            });
            const burst = new THREE.Mesh(burstGeometry, material);
            burst.rotation.x = Math.PI / 2.1;
            burst.userData = {
                progress: i * 0.33,
                speed: 0.00022 + i * 0.00005
            };
            this.scene.add(burst);
            this.decisionBursts.push(burst);
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.renderer.domElement.addEventListener('mouseup', () => this.onMouseUp());
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));

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
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeMeshes);

        if (this.hoveredNode) {
            this.hoveredNode.material.emissiveIntensity = this.hoveredNode.userData.isHub ? 0.6 : 0.25;
            this.renderer.domElement.style.cursor = 'grab';
        }

        if (intersects.length > 0) {
            this.hoveredNode = intersects[0].object;
            this.hoveredNode.material.emissiveIntensity = 0.65;
            this.renderer.domElement.style.cursor = 'pointer';
        } else {
            this.hoveredNode = null;
        }
    }

    onMouseDown() {
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

    onClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
        if (intersects.length > 0) {
            const clickedNode = intersects[0].object;
            this.pulseNode(clickedNode);
        }
    }

    pulseNode(node) {
        const originalScale = node.scale.x;
        const targetScale = originalScale * 1.6;
        const duration = 500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
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
            const floatX = Math.sin(this.time * 0.0008 + data.pulseOffset) * 1.6;
            const floatY = Math.cos(this.time * 0.0007 + data.pulseOffset) * 1.6;
            const floatZ = Math.sin(this.time * 0.0006 + data.pulseOffset) * 1.6;

            mesh.position.x = data.basePosition.x + floatX;
            mesh.position.y = data.basePosition.y + floatY;
            mesh.position.z = data.basePosition.z + floatZ;

            mesh.rotation.x += data.rotationSpeed;
            mesh.rotation.y += data.rotationSpeed * 1.3;

            const pulse = 1 + Math.sin(this.time * 0.0012 + data.pulseOffset) * 0.08;
            if (!this.isDragging || mesh !== this.hoveredNode) {
                mesh.scale.set(pulse, pulse, pulse);
            }

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
            line.material.opacity = line.userData.baseOpacity + Math.sin(this.time * 0.001 + line.userData.from) * 0.03;
        });

        this.decisionLines.forEach(line => {
            const from = this.nodes[line.userData.from].position;
            const to = this.nodes[line.userData.to].position;

            const positions = line.geometry.attributes.position;
            positions.setXYZ(0, from.x, from.y, from.z);
            positions.setXYZ(1, to.x, to.y, to.z);
            positions.needsUpdate = true;
            line.material.opacity = line.userData.baseOpacity + Math.sin(this.time * 0.0012 + line.userData.to) * 0.12;
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

            particle.position.lerpVectors(from, to, data.progress);
            const pulse = 0.6 + Math.sin(this.time * 0.005 + data.pulseOffset) * 0.25;
            particle.material.opacity = data.isDecision ? pulse + 0.2 : pulse;
            const scale = 1 + Math.sin(this.time * 0.004 + data.pulseOffset) * (data.isDecision ? 0.4 : 0.2);
            particle.scale.set(
                data.baseScale.x * scale,
                data.baseScale.y * scale,
                data.baseScale.z * scale
            );
        });
    }

    updateLabels() {
        this.labelSprites.forEach(label => {
            const node = this.nodes[label.nodeIndex];
            if (!node) return;
            const bob = Math.sin(this.time * 0.001 + label.drift) * 3;
            label.sprite.position.copy(node.position.clone().add(label.offset).add(new THREE.Vector3(0, bob, 0)));

            const distance = this.camera.position.distanceTo(label.sprite.position);
            const fade = THREE.MathUtils.clamp(1 - distance / 900, 0.35, 0.9);
            label.sprite.material.opacity = fade;
        });
    }

    updateGlow() {
        this.glowSprites.forEach(sprite => {
            const target = sprite.userData.target;
            if (!target) return;
            sprite.position.copy(target.position);
            const pulse = 1 + Math.sin(this.time * 0.001 + sprite.userData.drift) * 0.12;
            sprite.scale.set(
                sprite.userData.baseScale * pulse,
                sprite.userData.baseScale * pulse,
                1
            );
            sprite.material.opacity = sprite.userData.baseOpacity * (0.7 + Math.sin(this.time * 0.001 + sprite.userData.drift) * 0.2);
        });
    }

    updateScan() {
        this.scanMeshes.forEach(mesh => {
            if (mesh.userData.type === 'ring') {
                const t = (this.time * mesh.userData.speed + mesh.userData.phase) % 1;
                const scale = 0.7 + t * 0.6;
                mesh.scale.set(scale, scale, scale);
                mesh.material.opacity = 0.18 * (1 - t);
            }
            if (mesh.userData.type === 'beam') {
                mesh.rotation.z += mesh.userData.speed;
            }
        });
    }

    updateDecisionBursts() {
        this.decisionBursts.forEach(burst => {
            burst.userData.progress += burst.userData.speed;
            if (burst.userData.progress > 1) {
                burst.userData.progress = 0;
            }
            const scale = 1 + burst.userData.progress * 3.2;
            burst.scale.set(scale, scale, scale);
            burst.material.opacity = 0.22 * (1 - burst.userData.progress);
        });
    }

    updateRings() {
        this.rings.forEach(ring => {
            if (ring.userData && ring.userData.spin) {
                ring.rotation.z += ring.userData.spin;
            }
            if (ring.userData && ring.userData.drift) {
                ring.rotation.y += ring.userData.drift;
            }
        });
    }

    updateGrid() {
        this.gridPlanes.forEach(grid => {
            if (grid.userData && grid.userData.spin) {
                grid.rotation.z += grid.userData.spin;
            }
        });
    }

    animate() {
        this.time = Date.now();
        this.scene.rotation.y += this.settings.sceneRotation;
        if (this.settings.cameraDrift) {
            this.camera.position.x = Math.sin(this.time * 0.00008) * 40;
            this.camera.position.y = Math.cos(this.time * 0.00006) * 28;
            this.camera.lookAt(0, 0, 0);
        }

        this.updateNodes();
        this.updateConnections();
        this.updateParticles();
        this.updateLabels();
        this.updateGlow();
        this.updateScan();
        this.updateDecisionBursts();
        this.updateGrid();
        this.updateRings();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.nodeMeshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });

        this.connectionLines.forEach(line => {
            line.geometry.dispose();
            line.material.dispose();
        });

        this.decisionLines.forEach(line => {
            line.geometry.dispose();
            line.material.dispose();
        });

        this.particleMeshes.forEach(particle => {
            particle.geometry.dispose();
            particle.material.dispose();
        });

        this.labelSprites.forEach(label => {
            if (label.sprite.material.map) {
                label.sprite.material.map.dispose();
            }
            label.sprite.material.dispose();
        });

        this.glowSprites.forEach(sprite => {
            sprite.material.dispose();
        });
        if (this.glowTexture) {
            this.glowTexture.dispose();
        }

        this.decisionBursts.forEach(burst => {
            if (burst.geometry) burst.geometry.dispose();
            if (burst.material) burst.material.dispose();
        });

        this.rings.forEach(ring => {
            if (ring.geometry) ring.geometry.dispose();
            if (ring.material) ring.material.dispose();
        });

        this.gridPlanes.forEach(grid => {
            if (grid.geometry) grid.geometry.dispose();
            if (Array.isArray(grid.material)) {
                grid.material.forEach(mat => mat.dispose());
            } else if (grid.material) {
                grid.material.dispose();
            }
        });

        this.scanMeshes.forEach(mesh => {
            if (mesh.material && mesh.material.map) {
                mesh.material.map.dispose();
            }
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });

        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}

// Initialize graph when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const graphs = [];
    const siteGraph = new KnowledgeGraph('site-graph', { mode: 'background', pointerEvents: 'none' });
    if (siteGraph && siteGraph.container) {
        graphs.push(siteGraph);
    }

    const heroGraph = new KnowledgeGraph('hero-graph', { mode: 'hero', pointerEvents: 'auto' });
    if (heroGraph && heroGraph.container) {
        graphs.push(heroGraph);
    }

    window.addEventListener('beforeunload', () => {
        graphs.forEach(graph => graph.destroy());
    });
});
