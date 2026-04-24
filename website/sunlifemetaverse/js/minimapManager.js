// Office Minimap Management

class MinimapManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.minimapCanvas = null;
        this.minimapContext = null;
        this.minimapSize = 160;
        this.allMeshes = [];
        this.selectedMesh = null;
        this.bounds = null;
    }

    /**
     * Initialize minimap
     * @param {String} canvasId - Canvas element ID
     */
    initialize(canvasId) {
        this.minimapCanvas = document.getElementById(canvasId);
        if (!this.minimapCanvas) return;

        this.minimapCanvas.width = this.minimapSize;
        this.minimapCanvas.height = this.minimapSize;
        this.minimapContext = this.minimapCanvas.getContext('2d');

        this.render();
    }

    /**
     * Set meshes for minimap
     * @param {Array} meshes - Array of meshes
     */
    setMeshes(meshes) {
        this.allMeshes = meshes;
        this.calculateBounds();
        this.render();
    }

    /**
     * Calculate bounding box of all meshes
     */
    calculateBounds() {
        if (this.allMeshes.length === 0) return;

        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        this.allMeshes.forEach(mesh => {
            const boundingInfo = mesh.getBoundingInfo();
            const min = boundingInfo.boundingBox.minimumWorld;
            const max = boundingInfo.boundingBox.maximumWorld;

            if (min.x < minX) minX = min.x;
            if (max.x > maxX) maxX = max.x;
            if (min.z < minZ) minZ = min.z;
            if (max.z > maxZ) maxZ = max.z;
        });

        this.bounds = {
            minX, maxX, minZ, maxZ,
            width: maxX - minX,
            height: maxZ - minZ
        };
    }

    /**
     * Convert world coordinates to minimap coordinates
     * @param {Number} x - World X coordinate
     * @param {Number} z - World Z coordinate
     * @returns {Object} - Minimap coordinates
     */
    worldToMinimap(x, z) {
        if (!this.bounds) return { x: 0, y: 0 };

        const padding = 10;
        const availableSize = this.minimapSize - padding * 2;

        const normalizedX = (x - this.bounds.minX) / this.bounds.width;
        const normalizedZ = (z - this.bounds.minZ) / this.bounds.height;

        return {
            x: padding + normalizedX * availableSize,
            y: padding + normalizedZ * availableSize
        };
    }

    /**
     * Render minimap
     */
    render() {
        if (!this.minimapContext || !this.bounds) return;

        const ctx = this.minimapContext;

        // Clear canvas
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, this.minimapSize, this.minimapSize);

        // Draw border
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, this.minimapSize - 10, this.minimapSize - 10);

        // Draw all meshes as small rectangles
        this.allMeshes.forEach(mesh => {
            const center = mesh.getBoundingInfo().boundingBox.centerWorld;
            const pos = this.worldToMinimap(center.x, center.z);

            ctx.fillStyle = '#0072ce';
            ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);
        });

        // Draw selected mesh if any
        if (this.selectedMesh) {
            const center = this.selectedMesh.getBoundingInfo().boundingBox.centerWorld;
            const pos = this.worldToMinimap(center.x, center.z);

            ctx.fillStyle = '#e63946';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw camera position
        const camera = this.sceneManager.camera;
        if (camera) {
            const cameraPos = this.worldToMinimap(camera.position.x, camera.position.z);

            ctx.fillStyle = '#febe10';
            ctx.beginPath();
            ctx.arc(cameraPos.x, cameraPos.y, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#d4a00e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cameraPos.x, cameraPos.y, 4, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    /**
     * Update selected mesh
     * @param {BABYLON.Mesh} mesh - Selected mesh
     */
    updateSelectedMesh(mesh) {
        this.selectedMesh = mesh;
        this.render();
    }

    /**
     * Clear selected mesh
     */
    clearSelectedMesh() {
        this.selectedMesh = null;
        this.render();
    }

    /**
     * Start continuous rendering (for camera updates)
     */
    startContinuousRender() {
        const renderLoop = () => {
            this.render();
            requestAnimationFrame(renderLoop);
        };
        renderLoop();
    }
}
