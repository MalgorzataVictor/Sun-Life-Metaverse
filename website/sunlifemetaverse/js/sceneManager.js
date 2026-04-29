// Scene and Camera Management

class SceneManager {
    constructor(engine) {
        this.engine = engine;
        this.scene = null;
        this.camera = null;
        this.initialCameraState = {};
    }

    /**
     * Create and configure the 3D scene
     * @returns {BABYLON.Scene} - The created scene
     */
    createScene() {
        const scene = new BABYLON.Scene(this.engine);
scene.clearColor = new BABYLON.Color4(0.92, 0.89, 0.82, 1);
        this.camera = this.createCamera(scene);
        this.createLighting(scene);

        this.scene = scene;
        return scene;
    }

    /**
     * Create and configure the ArcRotate camera
     * @param {BABYLON.Scene} scene - The scene
     * @returns {BABYLON.ArcRotateCamera} - The camera
     */
    createCamera(scene) {
        const camera = new BABYLON.ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 3,
            100,
            new BABYLON.Vector3(0, 2, 0),
            scene
        );
        
        camera.attachControl(this.engine.getRenderingCanvas(), true);

        // Wheel settings
        camera.wheelPrecision = 10;
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 200;

        // Rotation sensitivity
        camera.angularSensibilityX = 4000;
        camera.angularSensibilityY = 4000;

        // Vertical rotation limits
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = Math.PI / 2;

        return camera;
    }

    /**
     * Create scene lighting
     * @param {BABYLON.Scene} scene - The scene
     */
    createLighting(scene) {
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    }

    /**
     * Create Babylon Sandbox style environment
     * @param {BABYLON.Scene} scene - The scene
     */
    createEnvironment(scene) {
        // Create default environment for studio lighting
        const envHelper = scene.createDefaultEnvironment({
            createSkybox: true,
            skyboxSize: 1000,
            skyboxColor: new BABYLON.Color3(0.93, 0.93, 0.95),
            createGround: false,
            groundSize: 1000,
            groundColor: new BABYLON.Color3(0.93, 0.93, 0.95),
            enableGroundShadow: false,
        });
        
        // Configure image processing for premium look
        scene.imageProcessingConfiguration.exposure = 1.1;
        scene.imageProcessingConfiguration.contrast = 1.05;
        scene.imageProcessingConfiguration.toneMappingEnabled = true;
        scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    }

    /**
     * Save the current camera state
     */
    saveInitialCameraState() {
        this.initialCameraState = {
            target: this.camera.target.clone(),
            radius: this.camera.radius,
            alpha: this.camera.alpha,
            beta: this.camera.beta
        };
    }

    /**
     * Reset camera to initial state with animation
     */
    resetCamera() {
        if (!this.initialCameraState.target) return;

        const s = this.initialCameraState;

        BABYLON.Animation.CreateAndStartAnimation(
            "camTarget",
            this.camera,
            "target",
            60,
            90,
            this.camera.target,
            s.target,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        BABYLON.Animation.CreateAndStartAnimation(
            "camRadius",
            this.camera,
            "radius",
            60,
            90,
            this.camera.radius,
            s.radius,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        BABYLON.Animation.CreateAndStartAnimation(
            "camAlpha",
            this.camera,
            "alpha",
            60,
            90,
            this.camera.alpha,
            s.alpha,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        BABYLON.Animation.CreateAndStartAnimation(
            "camBeta",
            this.camera,
            "beta",
            60,
            90,
            this.camera.beta,
            s.beta,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    }

    /**
     * Animate camera to focus on a mesh
     * @param {BABYLON.Mesh} mesh - The mesh to focus on
     */
    focusOnMesh(mesh) {
        const boundingInfo = mesh.getBoundingInfo();
        const center = boundingInfo.boundingBox.centerWorld;
        const targetRadius = Math.max(boundingInfo.boundingBox.extendSize.length() * 3, 10);

        BABYLON.Animation.CreateAndStartAnimation(
            "camMove", 
            this.camera, 
            "target", 
            60, 
            90,
            this.camera.target, 
            center, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        BABYLON.Animation.CreateAndStartAnimation(
            "camZoom", 
            this.camera, 
            "radius", 
            60, 
            90,
            this.camera.radius, 
            targetRadius, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    }

    /**
     * Go to top-down view of the entire scene
     */
    goTopDownView() {
        const bounds = this.scene.getWorldExtends();
        const center = bounds.min.add(bounds.max).scale(0.5);
        const size = BABYLON.Vector3.Distance(bounds.min, bounds.max);

        BABYLON.Animation.CreateAndStartAnimation(
            "topAlpha",
            this.camera,
            "alpha",
            60,
            30,
            this.camera.alpha,
            Math.PI / 2,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        BABYLON.Animation.CreateAndStartAnimation(
            "topBeta",
            this.camera,
            "beta",
            60,
            30,
            this.camera.beta,
            0.05,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        BABYLON.Animation.CreateAndStartAnimation(
            "topZoom",
            this.camera,
            "radius",
            60,
            30,
            this.camera.radius,
            size * 1,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        this.camera.setTarget(center);
    }

    /**
     * Auto-adjust camera to view the entire scene
     */
    autoAdjustCamera() {
        const boundingInfo = this.scene.getWorldExtends();
        const center = boundingInfo.min.add(boundingInfo.max).scale(0.5);

        this.camera.setTarget(center);
        this.camera.radius = BABYLON.Vector3.Distance(boundingInfo.min, boundingInfo.max) * 0.8;
    }
}
