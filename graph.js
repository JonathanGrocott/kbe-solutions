// Animated Knowledge Graph Visualization - DBpedia Style
class KnowledgeGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.animationFrame = null;
        this.time = 0;
        
        // Dark theme color palette - vibrant against dark background
        this.colors = {
            nodes: [
                '#6366f1', // Indigo
                '#0ea5e9', // Sky blue  
                '#10b981', // Emerald
                '#f59e0b', // Amber
                '#ef4444', // Red
                '#8b5cf6', // Purple
                '#ec4899', // Pink
                '#14b8a6'  // Teal
            ],
            connections: 'rgba(148, 163, 184, 0.15)',
            particles: '#818cf8',
            background: '#131318' // Dark surface color
        };
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        this.resize();
        this.createNodes();
        this.createConnections();
    }
    
    resize() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, 500);
        this.canvas.width = size;
        this.canvas.height = size;
        this.width = size;
        this.height = size;
        this.centerX = size / 2;
        this.centerY = size / 2;
    }
    
    createNodes() {
        // Create a more interconnected network like DBpedia's LOD cloud visualization
        const nodeCount = 25; // More nodes for richer visualization
        const centerRegionRadius = Math.min(this.width, this.height) * 0.15;
        const maxRadius = Math.min(this.width, this.height) * 0.4;
        
        // Create nodes in clusters with varied sizes
        for (let i = 0; i < nodeCount; i++) {
            // Distribute nodes in a more organic, clustered way
            const angle = (i / nodeCount) * Math.PI * 2 + Math.random() * 0.5;
            const distanceFromCenter = centerRegionRadius + Math.random() * (maxRadius - centerRegionRadius);
            
            // Vary node sizes more dramatically
            const sizeCategory = Math.random();
            let radius;
            if (sizeCategory < 0.6) {
                radius = 6 + Math.random() * 6; // Small nodes (60%)
            } else if (sizeCategory < 0.85) {
                radius = 12 + Math.random() * 8; // Medium nodes (25%)
            } else {
                radius = 20 + Math.random() * 10; // Large hub nodes (15%)
            }
            
            const x = this.centerX + Math.cos(angle) * distanceFromCenter;
            const y = this.centerY + Math.sin(angle) * distanceFromCenter;
            
            this.nodes.push({
                x: x,
                y: y,
                baseX: x,
                baseY: y,
                radius: radius,
                baseRadius: radius,
                color: this.colors.nodes[i % this.colors.nodes.length],
                angle: angle,
                distance: distanceFromCenter,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                mass: radius, // Larger nodes have more mass
                pulseOffset: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.0005
            });
        }
    }
    
    createConnections() {
        // Create connections based on proximity and size (larger nodes connect to more)
        this.nodes.forEach((node, i) => {
            const connectionCount = Math.floor(node.radius / 4); // Larger nodes = more connections
            const targets = [];
            
            // Find closest nodes
            const distances = this.nodes.map((other, j) => {
                if (i === j) return { index: j, distance: Infinity };
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                return { index: j, distance: Math.sqrt(dx * dx + dy * dy) };
            });
            
            distances.sort((a, b) => a.distance - b.distance);
            
            // Connect to closest nodes
            for (let c = 0; c < Math.min(connectionCount, 5); c++) {
                const target = distances[c].index;
                if (target !== i) {
                    // Check if connection already exists
                    const exists = this.connections.some(conn => 
                        (conn.from === i && conn.to === target) ||
                        (conn.from === target && conn.to === i)
                    );
                    
                    if (!exists) {
                        this.connections.push({
                            from: i,
                            to: target,
                            strength: 0.1 + Math.random() * 0.3,
                            particleSpeed: 0.005 + Math.random() * 0.01
                        });
                    }
                }
            }
        });
        
        // Create animated particles on connections
        this.connections.forEach((conn, idx) => {
            const particleCount = Math.random() > 0.5 ? 1 : 2;
            for (let i = 0; i < particleCount; i++) {
                this.particles.push({
                    connection: idx,
                    progress: Math.random(),
                    speed: conn.particleSpeed,
                    size: 1.5 + Math.random() * 1.5
                });
            }
        });
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createNodes();
            this.createConnections();
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    updateNodes(time) {
        this.time = time;
        
        this.nodes.forEach((node, idx) => {
            // Gentle floating motion
            node.angle += node.rotationSpeed;
            const floatX = Math.sin(time * 0.0008 + node.pulseOffset) * 1.5;
            const floatY = Math.cos(time * 0.0006 + node.pulseOffset) * 1.5;
            
            node.x = node.baseX + floatX;
            node.y = node.baseY + floatY;
            
            // Very subtle size pulsing
            const pulse = 1 + Math.sin(time * 0.0015 + node.pulseOffset) * 0.08;
            node.radius = node.baseRadius * pulse;
            
            // Mouse interaction - attract smaller nodes, repel larger ones
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - node.x;
                const dy = this.mouse.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const force = (120 - distance) / 120;
                    const strength = node.radius < 15 ? 3 : -5; // Small nodes attract, large repel
                    node.x += (dx / distance) * force * strength;
                    node.y += (dy / distance) * force * strength;
                }
            }
        });
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.progress += particle.speed;
            if (particle.progress > 1) {
                particle.progress = 0;
            }
        });
    }
    
    drawConnections() {
this.ctx.globalAlpha = 0.5;
        
        this.connections.forEach(conn => {
            const from = this.nodes[conn.from];
            const to = this.nodes[conn.to];
            
            // Calculate distance for dynamic opacity
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.min(this.width, this.height) * 0.5;
            const opacity = Math.max(0.15, 1 - (distance / maxDistance));
            
            // Draw connection with curved path for more organic feel
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            
            // Calculate control point for curve
            const perpX = -(to.y - from.y);
            const perpY = (to.x - from.x);
            const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
            const curvature = 0.1;
            const controlX = midX + (perpX / perpLength) * distance * curvature;
            const controlY = midY + (perpY / perpLength) * distance * curvature;
            
            this.ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.4})`;
            this.ctx.lineWidth = conn.strength * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.quadraticCurveTo(controlX, controlY, to.x, to.y);
            this.ctx.stroke();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const conn = this.connections[particle.connection];
            const from = this.nodes[conn.from];
            const to = this.nodes[conn.to];
            
            // Calculate curved path position
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            
            const perpX = -dy;
            const perpY = dx;
            const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
            const curvature = 0.1;
            const controlX = midX + (perpX / perpLength) * distance * curvature;
            const controlY = midY + (perpY / perpLength) * distance * curvature;
            
            // Calculate position on curve
            const t = particle.progress;
            const mt = 1 - t;
            const x = mt * mt * from.x + 2 * mt * t * controlX + t * t * to.x;
            const y = mt * mt * from.y + 2 * mt * t * controlY + t * t * to.y;
            
            // Draw particle with subtle glow
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, particle.size * 2);
            gradient.addColorStop(0, this.colors.particles);
            gradient.addColorStop(0.5, this.colors.particles + '88');
            gradient.addColorStop(1, this.colors.particles + '00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Bright center
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawNodes() {
        this.nodes.forEach((node, idx) => {
            // Draw subtle outer glow - enhanced for dark background
            const glowGradient = this.ctx.createRadialGradient(
                node.x, node.y, node.radius * 0.3,
                node.x, node.y, node.radius * 2.5
            );
            glowGradient.addColorStop(0, node.color + '66');
            glowGradient.addColorStop(0.5, node.color + '33');
            glowGradient.addColorStop(1, node.color + '00');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * 2.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw main node with solid color (DBpedia style)
            this.ctx.fillStyle = node.color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add white border for clarity
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = Math.max(1.5, node.radius / 8);
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Add subtle inner shadow for depth
            const innerGradient = this.ctx.createRadialGradient(
                node.x - node.radius * 0.3,
                node.y - node.radius * 0.3,
                0,
                node.x,
                node.y,
                node.radius
            );
            innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            innerGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
            innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
            
            this.ctx.fillStyle = innerGradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    animate() {
        const time = Date.now();
        
        // Clear canvas completely for clean rendering
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Update and draw in correct order
        this.updateNodes(time);
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        this.drawNodes();
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
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
