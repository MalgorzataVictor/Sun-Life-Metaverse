// Mesh Management Utilities

class MeshManager {
    /**
     * Merge primitives in a mesh list by grouping meshes with the same base name
     * @param {Array} meshList - List of meshes to process
     * @returns {Array} - List of merged meshes
     */
    static mergePrimitivesInList(meshList) {
        const groups = {};

        meshList.forEach(m => {
            const baseName = m.name.replace(/_primitive\d+/i, "");
            if (!groups[baseName]) groups[baseName] = [];
            groups[baseName].push(m);
        });

        const finalList = [];

        for (let name in groups) {
            const meshes = groups[name];

            if (meshes.length === 1) {
                finalList.push(meshes[0]);
                continue;
            }

            const merged = BABYLON.Mesh.MergeMeshes(meshes, true, true, undefined, false, true);

            if (merged) {
                merged.name = name;
                finalList.push(merged);
            }
        }

        return finalList;
    }

    /**
     * Filter meshes by prefix
     * @param {Array} meshes - Scene meshes
     * @param {String} prefix - Prefix to filter by
     * @returns {Array} - Filtered meshes
     */
    static filterByPrefix(meshes, prefix) {
        return meshes.filter(m => m.name.includes(prefix));
    }

    /**
     * Clean mesh name by removing prefix and trailing underscores
     * @param {String} name - Mesh name
     * @param {String} prefix - Prefix to remove
     * @returns {String} - Cleaned name
     */
    static cleanMeshName(name, prefix = "RL_") {
        let cleanName = name.replace(prefix, "");
        if (cleanName.endsWith("_")) cleanName = cleanName.slice(0, -1);
        return cleanName;
    }
}
