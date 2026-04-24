// Zone Management and Highlighting

class ZoneManager {
    constructor(highlightLayer) {
        this.highlightLayer = highlightLayer;
        this.collabZone = [
            "01N001", "01N002", "01N003", "01N005", "01N006", "01N027", "01N028",
            "01N029", "01N030", "01N092", "01N093", "01N101",
            "01E033", "01E034_Kitchen", "01E036_CourtYard", "01E037", "01E038_Office2",
            "01E060", "01E092", "01E093", "01E094",
            "01W008_Pool", "01W009_Library", "01W010", "01W020_Crystal",
            "01W055", "01W056", "01W057", "01W058", "01W059",
            "01W061", "01W062", "01W063_Dunmore", "01W064",
            "01W067_Lismore", "01W068_Greenway",
            "01W095_Viking", "01W096", "01W097", "01W098", "01W099",
            "01W103", "01W104", "01W105", "01W106",
            "01W107_SensoryRoom", "01W108_TableTennis",
            "01S001_VRRoom", "01S002_Office1", "01S003", "01S004_SupportCentre",
            "01S009", "01S010",
            "S01028_Reception", "S01029", "S01030", "S01016",
            "S01035", "S01036", "S01038", "S01050",
            "WestFloors", "EastFloors", "NorthFloors", "SouthFloors"
        ];

        this.villageZone = [
            "01S005_Techbar",
            "01S006",
            "S01044_Coffee",
            "S01014_Canteen"
        ];
    }

    /**
     * Setup zone filter buttons
     * @param {Array} allMeshes - All meshes in the scene
     */
    setupZoneFilters(allMeshes) {
        const collabBtn = document.getElementById("collabZoneBtn");
        const villageBtn = document.getElementById("villageZoneBtn");

        // Track active state
        let collabActive = false;
        let villageActive = false;

        const updateHighlights = () => {
            this.updateZoneHighlights(allMeshes, collabActive, villageActive);
        };

        collabBtn.addEventListener("click", () => {
            collabActive = !collabActive;
            collabBtn.classList.toggle("active", collabActive);
            updateHighlights();
        });

        villageBtn.addEventListener("click", () => {
            villageActive = !villageActive;
            villageBtn.classList.toggle("active", villageActive);
            updateHighlights();
        });
    }

    /**
     * Update zone highlights based on checkbox states
     * @param {Array} allMeshes - All meshes
     * @param {Boolean} showCollab - Show collaborative zone
     * @param {Boolean} showVillage - Show village zone
     */
    updateZoneHighlights(allMeshes, showCollab, showVillage) {
        this.highlightLayer.removeAllMeshes();

        allMeshes.forEach(mesh => {
            const cleanName = MeshManager.cleanMeshName(mesh.name);

            if (showCollab && this.collabZone.includes(cleanName)) {
                // #0096FF - Blue for collaboration
                this.highlightLayer.addMesh(mesh, new BABYLON.Color3(0, 0.588, 1));
            }

            if (showVillage && this.villageZone.includes(cleanName)) {
                // #50C878 - Green for village
                this.highlightLayer.addMesh(mesh, new BABYLON.Color3(0.314, 0.784, 0.471));
            }
        });
    }

    /**
     * Check if a mesh is in collaborative zone
     * @param {String} meshName - Mesh name
     * @returns {Boolean}
     */
    isInCollabZone(meshName) {
        const cleanName = MeshManager.cleanMeshName(meshName);
        return this.collabZone.includes(cleanName);
    }

    /**
     * Check if a mesh is in village zone
     * @param {String} meshName - Mesh name
     * @returns {Boolean}
     */
    isInVillageZone(meshName) {
        const cleanName = MeshManager.cleanMeshName(meshName);
        return this.villageZone.includes(cleanName);
    }
}
