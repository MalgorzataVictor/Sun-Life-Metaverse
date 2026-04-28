// Navigation and Pathfinding Management

class NavigationManager {
    constructor(scene) {
        this.scene = scene;
        this.navigationPlugin = null;
        this.crowd = null;
        this.agentIndex = null;
        this.agentMesh = null;
        this.startPos = null;
        this.pathMesh = null;
    }

    /**
     * Initialize navigation plugin with Recast
     * @param {Object} recast - Recast module
     */
    async initializeNavigation(recast) {
        this.navigationPlugin = new BABYLON.RecastJSPlugin(recast);
    }

    /**
     * Create navigation mesh from scene meshes
     * @param {Array} meshes - Visible meshes to use for navmesh
     */
    createNavMesh(meshes) {
        const parameters = {
            cs: 0.2,                    // Cell size - larger = more connected
            ch: 0.2,                    // Cell height - larger = more connected
            walkableSlopeAngle: 35,     // Maximum slope angle (increased)
            walkableHeight: 2,          // Minimum ceiling height
            walkableClimb: 1.0,         // Maximum step height (increased)
            walkableRadius: 0.3,        // Agent radius (smaller to fit through gaps)
            maxEdgeLen: 12,
            maxSimplificationError: 3.0, // Higher = more connected
            minRegionArea: 3,           // Lower = allow smaller regions
            mergeRegionArea: 10,        // Lower = merge more regions
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1.0,  // Higher = more connected
        };
        this.navigationPlugin.createNavMesh(meshes, parameters);
      /*   var navmeshdebug = this.navigationPlugin.createDebugNavMesh(this.scene);
        navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);

        var matdebug = new BABYLON.StandardMaterial('matdebug', scene);
        matdebug.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
        matdebug.alpha = 0.2;
        navmeshdebug.material = matdebug; */
    }

    /**
     * Create crowd for agent management
     * @param {Number} maxAgents - Maximum number of agents
     * @param {Number} maxRadius - Maximum agent radius
     */
    createCrowd(maxAgents = 10, maxRadius = 0.1) {
        this.crowd = this.navigationPlugin.createCrowd(maxAgents, maxRadius, this.scene);
    }

    /**
     * Create and configure the agent
     * @param {BABYLON.Vector3} startPosition - Starting position for the agent
     * @returns {BABYLON.Mesh} - The agent mesh
     */
    createAgent(startPosition) {
        const agentParams = {
            radius: 0.2,
            height: 1.2,
            maxAcceleration: 10,
            maxSpeed: 5,
            collisionQueryRange: 10,
            pathOptimizationRange: 10,
            separationWeight: 1
        };

        this.agentMesh = BABYLON.MeshBuilder.CreateSphere("agent", {
            diameter: 1
        }, this.scene);

        const agentMat = new BABYLON.StandardMaterial("agentMat", this.scene);
        agentMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
        this.agentMesh.material = agentMat;

        this.agentMesh.position = new BABYLON.Vector3(0, 0.9, 0);

        // Hide the agent sphere, only show the path line
        this.agentMesh.isVisible = false;

        const navStartPos = this.navigationPlugin.getClosestPoint(startPosition);
        this.startPos = navStartPos.clone();

        this.agentIndex = this.crowd.addAgent(navStartPos, agentParams, this.agentMesh);

        return this.agentMesh;
    }

    /**
     * Update agent position on each frame
     */
    updateAgentPosition() {
        if (!this.crowd || this.agentIndex === null) return;

        const pos = this.crowd.getAgentPosition(this.agentIndex);

        this.agentMesh.position.x = pos.x;
        this.agentMesh.position.z = pos.z;
        this.agentMesh.position.y = pos.y + 0.9;
    }

    /**
     * Navigate agent to a destination mesh
     * @param {BABYLON.Mesh} destinationMesh - Target mesh
     * @returns {BABYLON.Mesh} - The path visualization mesh
     */
    navigateToMesh(destinationMesh) {
        if (!destinationMesh || !this.crowd) return null;

        // Always reset agent to Techbar start position first
        if (this.startPos) {
            this.crowd.agentTeleport(this.agentIndex, this.startPos);
        }

        const targetPos = this.navigationPlugin.getClosestPoint(
            destinationMesh.getBoundingInfo().boundingBox.centerWorld
        );

        this.crowd.agentGoto(this.agentIndex, targetPos);

        // Compute and visualize path from Techbar (startPos) to destination
        const rawPath = this.navigationPlugin.computePath(
            this.startPos,
            this.navigationPlugin.getClosestPoint(targetPos)
        );

        return this.createPathVisualization(rawPath);
    }

    /**
     * Convert path to Manhattan style (90-degree turns only)
     * @param {Array} path - Original path points
     * @returns {Array} - Path with only 90-degree turns
     */
    convertTo90DegreePath(path) {
        if (path.length < 2) return path;

        const manhattanPath = [path[0]]; // Start with the first point

        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const curr = path[i];

            // Calculate differences
            const dx = Math.abs(curr.x - prev.x);
            const dz = Math.abs(curr.z - prev.z);

            // Move in the dominant direction first
            if (dx > dz) {
                // Move horizontally first, then vertically
                const midPoint = new BABYLON.Vector3(curr.x, prev.y, prev.z);
                if (dx > 0.1) { // Only add if there's significant movement
                    manhattanPath.push(midPoint);
                }
                manhattanPath.push(curr);
            } else {
                // Move vertically first, then horizontally
                const midPoint = new BABYLON.Vector3(prev.x, prev.y, curr.z);
                if (dz > 0.1) { // Only add if there's significant movement
                    manhattanPath.push(midPoint);
                }
                manhattanPath.push(curr);
            }
        }

        return manhattanPath;
    }

    /**
     * Create visual path tube
     * @param {Array} path - Array of path points
     * @returns {BABYLON.Mesh} - The path mesh
     */
    createPathVisualization(path) {
        // Dispose of old path
        if (this.pathMesh) {
            this.pathMesh.dispose();
        }

        // Convert to 90-degree turns
        const manhattanPath = this.convertTo90DegreePath(path);

        // Lift path slightly above floor
        const liftedPath = manhattanPath.map(p =>
            new BABYLON.Vector3(p.x, p.y + 0.90, p.z)
        );

        // Create thick tube path
        this.pathMesh = BABYLON.MeshBuilder.CreateTube(
            "pathTube",
            {
                path: liftedPath,
                radius: 0.30,
                tessellation: 8,
                updatable: false
            },
            this.scene
        );

        // Matte red material (no reflections)
        const mat = new BABYLON.StandardMaterial("pathMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
        mat.specularColor = new BABYLON.Color3(0, 0, 0); // No specular highlights
        mat.emissiveColor = new BABYLON.Color3(0, 0, 0); // No glow/emission
        this.pathMesh.material = mat;

        return this.pathMesh;
    }

    /**
     * Reset agent to start position
     */
    resetAgent() {
        if (this.crowd && this.agentIndex !== null && this.startPos) {
            this.crowd.agentTeleport(this.agentIndex, this.startPos);
            this.crowd.agentGoto(this.agentIndex, this.startPos);

            if (this.pathMesh) {
                this.pathMesh.dispose();
                this.pathMesh = null;
            }
        }
    }

    /**
     * Clear navigation path without resetting agent
     */
    clearPath() {
        if (this.pathMesh) {
            this.pathMesh.dispose();
            this.pathMesh = null;
        }

        // Stop agent movement
        if (this.crowd && this.agentIndex !== null && this.agentMesh) {
            const currentPos = this.agentMesh.position;
            this.crowd.agentGoto(this.agentIndex, currentPos);
        }
    }

    /**
     * Get closest point on navmesh
     * @param {BABYLON.Vector3} position - World position
     * @returns {BABYLON.Vector3} - Closest point on navmesh
     */
    getClosestPoint(position) {
        return this.navigationPlugin.getClosestPoint(position);
    }
}
