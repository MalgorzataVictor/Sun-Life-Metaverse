


// Main Application - Modular SunLife Metaverse
// This file orchestrates all the separate manager classes

class SunLifeMetaverse {
    constructor(canvasId, dropdownId, inputId, spinnerId, selectedRoomId) {
        // Core Babylon.js setup
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true);

        // UI elements
        this.spinner = document.getElementById(spinnerId);
        this.navigateBtn = document.getElementById("navigateBtn");
        this.pinBtn = document.getElementById("pinBtn");
        this.buttonContainer = document.getElementById("buttonContainer");

        // Manager instances
        this.sceneManager = null;
        this.navigationManager = null;
        this.zoneManager = null;
        this.searchManager = null;
        this.recommendedRoomsManager = null;

        // Scene data
        this.allMeshes = [];
        this.highlightLayer = null;
        this.destinationMesh = null;
        this.startMeshName = "01S005_Techbar";
        this.pinMarker = null;

        // UI element IDs for later initialization
        this.dropdownId = dropdownId;
        this.inputId = inputId;
        this.selectedRoomId = selectedRoomId;

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.showSpinner(true);

        // Initialize navigation with Recast
        const recast = await Recast();

        // Create manager instances
        this.sceneManager = new SceneManager(this.engine);
        const scene = this.sceneManager.createScene();

        // Create highlight layer
        this.highlightLayer = new BABYLON.HighlightLayer("hl1", scene);

        // Initialize managers
        this.navigationManager = new NavigationManager(scene);
        await this.navigationManager.initializeNavigation(recast);

        // Setup managers with necessary references
        this.zoneManager = new ZoneManager(this.highlightLayer);
        this.searchManager = new SearchManager(this.highlightLayer, this.sceneManager);
        this.recommendedRoomsManager = new RecommendedRoomsManager(null, this.searchManager);

        // Setup render loop
        this.engine.runRenderLoop(() => scene.render());
        window.addEventListener("resize", () => this.engine.resize());

        // Load 3D model and setup scene

        this.loadModel(scene);

        // Setup UI event listeners
        this.setupEventListeners();
    }


    /**
     * Load 3D model and setup navigation
     */
    loadModel(scene) {
        // Load floors/walls first
        BABYLON.SceneLoader.Append("", "models/Slm.glb", scene,
            // Success callback - floors/walls loaded, now load props
            () => {
                console.log("Loaded Slm.glb (floors/walls)");

                // Load props on top
                BABYLON.SceneLoader.Append("", "models/Props-optimized.glb", scene,
                    // Success callback - both models loaded
                    () => {
                        console.log("Loaded Props-optimized.glb (props)");

                        scene.materials.forEach(mat => {
                            if (mat.name === "Wall_Yellow_Accent") {

                                mat.albedoColor = new BABYLON.Color3(1, 0.82, 0.0);

                                mat.metallic = 0;
                                mat.roughness = 1;
                                mat.emissiveColor = BABYLON.Color3.Black();
                            }
                        });

                        // Filter and process meshes
                        this.allMeshes = MeshManager.filterByPrefix(scene.meshes, "RL_");
                        this.allMeshes = MeshManager.mergePrimitivesInList(this.allMeshes);

                        // Auto-adjust camera to view entire scene
                        this.sceneManager.autoAdjustCamera();
                        this.sceneManager.saveInitialCameraState();

                        // Setup navigation mesh - exclude doors from navmesh
                        const navmeshMeshes = scene.meshes.filter(m => {
                            if (!m.isVisible) return false;

                            // Check if any parent in the hierarchy contains door keywords
                            let currentNode = m;
                            while (currentNode) {
                                const nodeName = currentNode.name.toLowerCase();
                                if (nodeName.includes('doorl') || nodeName.includes('doorr') || nodeName.includes('dooro')) {
                                    return false;
                                }
                                // Exclude Props folder from navmesh
                                if (nodeName.includes('props')) {
                                    return false;
                                }
                                currentNode = currentNode.parent;
                            }

                            return true;
                        });

                        console.log("NavMesh size:", navmeshMeshes.length);
                        this.navigationManager.createNavMesh(navmeshMeshes);
                        this.navigationManager.createCrowd();

                        // Create agent at starting position
                        const startMesh = scene.getMeshByName("RL_" + this.startMeshName);
                        if (startMesh) {
                            const startPos = startMesh.getBoundingInfo().boundingBox.centerWorld;
                            this.navigationManager.createAgent(startPos);
                        }

                        // Setup search and zones
                        this.searchManager.setMeshes(this.allMeshes);
                        this.searchManager.setZoneManager(this.zoneManager);
                        this.zoneManager.setupZoneFilters(this.allMeshes);

                        // Setup scene interactions
                        this.setupSceneInteractions(scene);

                        this.showSpinner(false);
                    }
                );
            });
    }

    /**
     * Setup scene pointer and render loop interactions
     */
    setupSceneInteractions(scene) {
        // Handle mesh clicking
        scene.onPointerObservable.add(pointerInfo => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
                const picked = pointerInfo.pickInfo.pickedMesh;
                if (picked && picked.name.includes("RL_")) {
                    this.searchManager.selectMesh(picked);
                }
            }
        });

        // Update agent position on each frame
        scene.onBeforeRenderObservable.add(() => {
            this.navigationManager.updateAgentPosition();
        });
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Initialize search UI
        this.searchManager.initialize(this.dropdownId, this.inputId, this.selectedRoomId);

        // Handle rooms data loaded
        this.searchManager.onRoomsDataLoaded((roomsData) => {
            this.recommendedRoomsManager.updateRoomsData(roomsData);
        });

        // Handle mesh selection
        this.searchManager.onMeshSelected((mesh) => {
            this.destinationMesh = mesh;
            if (this.buttonContainer) {
                this.buttonContainer.style.display = "flex";
            }
        });

        // Handle selection cleared
        this.searchManager.onClearSelection(() => {
            // Remove pin marker if it exists
            if (this.pinMarker) {
                this.pinMarker.dispose();
                this.pinMarker = null;
            }
            // Clear navigation path
            this.navigationManager.clearPath();
            this.destinationMesh = null;
        });

        // Navigate button
        this.navigateBtn.addEventListener("click", () => {
            this.handleNavigation();
        });

        // Pin button
        this.pinBtn.addEventListener("click", () => {
            this.togglePinMarker();
        });

        // Reset view button
        document.getElementById("resetViewBtn")
            .addEventListener("click", () => this.resetView());
    }

    /**
     * Handle navigation to selected destination
     */
    handleNavigation() {
        if (!this.destinationMesh) return;

        // Navigate agent and create path visualization
        this.navigationManager.navigateToMesh(this.destinationMesh);

        // Move camera to top-down view
        this.sceneManager.goTopDownView();
    }

    /**
     * Toggle pin marker above selected mesh
     */
    togglePinMarker() {
        if (!this.destinationMesh) return;

        const scene = this.sceneManager.scene;

        // Remove existing pin marker if it exists
        if (this.pinMarker) {
            this.pinMarker.dispose();
            this.pinMarker = null;
            return;
        }

        // Get the bounding box of the selected mesh
        const boundingInfo = this.destinationMesh.getBoundingInfo();
        const center = boundingInfo.boundingBox.centerWorld;
        const maxY = boundingInfo.boundingBox.maximumWorld.y;

        // Create pin marker (cone pointing down)
        this.pinMarker = BABYLON.MeshBuilder.CreateCylinder("pinMarker", {
            diameterTop: 0,
            diameterBottom: 0.8,
            height: 2.5,
            tessellation: 8
        }, scene);

        // Position it above the mesh
        this.pinMarker.position = new BABYLON.Vector3(
            center.x,
            maxY + 4,
            center.z
        );

        // Rotate to point down
        this.pinMarker.rotation.x = Math.PI;

        // Create material for the pin
        const pinMaterial = new BABYLON.StandardMaterial("pinMaterial", scene);
        pinMaterial.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2); // Red color
        pinMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.1, 0.1); // Slight glow
        this.pinMarker.material = pinMaterial;
    }

    /**
     * Reset camera and agent to initial state
     */
    resetView() {
        this.navigationManager.resetAgent();
        this.sceneManager.resetCamera();

        // Hide button container
        if (this.buttonContainer) {
            this.buttonContainer.style.display = "none";
        }

        // Remove pin marker if it exists
        if (this.pinMarker) {
            this.pinMarker.dispose();
            this.pinMarker = null;
        }

        this.destinationMesh = null;
    }

    /**
     * Show or hide loading spinner
     */
    showSpinner(show) {
        if (this.spinner) {
            this.spinner.style.display = show ? "flex" : "none";
        }
    }
}

// Initialize application when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
    new SunLifeMetaverse(
        "renderCanvas",
        "roomDropdown",
        "roomInput",
        "spinner",
        "selectedRoomName"
    );
});