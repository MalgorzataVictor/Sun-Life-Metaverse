class SunLifeMetaverse {
    constructor(canvasId, dropdownId, inputId, spinnerId, selectedRoomId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true);

        this.scene = null;
        this.camera = null;
        this.allMeshes = [];
        this.highlightLayer = null;

        this.dropdown = document.getElementById(dropdownId);
        this.input = document.getElementById(inputId);
        this.spinner = document.getElementById(spinnerId);
        this.selectedRoomDiv = document.getElementById(selectedRoomId);

        this.selectedMesh = null;

        this.init();
    }

    init() {
        this.showSpinner(true);
        this.scene = this.createScene();

        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());

        this.setupSearchDropdown();
    }

    createScene() {
        const scene = new BABYLON.Scene(this.engine);
        scene.clearColor = new BABYLON.Color3(0.95, 0.95, 0.95);

        // Camera
        this.camera = new BABYLON.ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 3,
            20,
            new BABYLON.Vector3(0, 2, 0),
            scene
        );
        this.camera.attachControl(this.canvas, true);

        // Light
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

        // Highlight layer
        this.highlightLayer = new BABYLON.HighlightLayer("hl1", scene);

        // Load model
        BABYLON.SceneLoader.Append("", "slm.glb", scene, () => {
            console.log("Model loaded!");
            this.allMeshes = scene.meshes.filter(m => m.name.includes("RL_"));

            // Clean names: remove __primitive0/1 suffix
            this.allMeshes.forEach(m => {
                m.name = m.name.split("|").pop().replace(/__primitive\d+$/, "");
            });

            this.updateDropdownOptions();
            this.showSpinner(false);
        });

        // Click-to-select
        scene.onPointerObservable.add(pointerInfo => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
                const picked = pointerInfo.pickInfo.pickedMesh;
                if (picked && picked.name.includes("RL_")) this.selectMesh(picked);
            }
        });

        return scene;
    }

    // Spinner
    showSpinner(show) {
        if (this.spinner) this.spinner.style.display = show ? "flex" : "none";
    }

    // Dropdown live search
    setupSearchDropdown() {
        this.input.addEventListener("input", () => this.updateDropdownOptions(this.input.value));
        this.dropdown.addEventListener("change", () => this.searchRoom(this.dropdown.value));
    }

    updateDropdownOptions(filter = "") {
        if (!this.dropdown) return;
        const filterLower = filter.toLowerCase();
        this.dropdown.innerHTML = "";
        this.allMeshes
            .filter(m => m.name.toLowerCase().includes(filterLower))
            .forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.name;
                opt.textContent = m.name;
                this.dropdown.appendChild(opt);
            });
    }

    // Search & select room
    searchRoom(roomName) {
        if (!roomName) return;
        const mesh = this.allMeshes.find(m => m.name.toLowerCase() === roomName.toLowerCase());
        if (!mesh) {
            alert("Room not found!");
            return;
        }
        this.selectMesh(mesh);
    }

    // Select a room mesh
    selectMesh(mesh) {
        // Remove previous highlight
        if (this.selectedMesh) this.highlightLayer.removeAllMeshes();

        this.selectedMesh = mesh;

        // Highlight selected mesh
        this.highlightLayer.addMesh(mesh, BABYLON.Color3.Yellow());

        // Update top bar room name
        if (this.selectedRoomDiv) {
            this.selectedRoomDiv.textContent = mesh.name;
        }

        // Smooth camera animation with limited zoom
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

    // JSON export
    generateRLMeshJSON() {
        const names = this.allMeshes.map(m => m.name);
        const json = JSON.stringify(names, null, 2);
        console.log("RL_ meshes JSON:\n", json);
        return json;
    }

    downloadRLMeshJSON(filename = "RL_meshes.json") {
        const json = this.generateRLMeshJSON();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize app
window.addEventListener("DOMContentLoaded", () => {
    const app = new SunLifeMetaverse(
        "renderCanvas",
        "roomDropdown",
        "roomInput",
        "spinner",
        "selectedRoomName"
    );
});