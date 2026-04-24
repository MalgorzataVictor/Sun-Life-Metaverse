// Search and Selection Management

class SearchManager {
    constructor(highlightLayer, sceneManager) {
        this.highlightLayer = highlightLayer;
        this.sceneManager = sceneManager;
        this.zoneManager = null;
        this.allMeshes = [];
        this.selectedMesh = null;
        this.dropdown = null;
        this.input = null;
        this.selectedRoomDiv = null;
        this.dropdownWrapper = null;
        this.dropdownToggle = null;
        this.onMeshSelectedCallback = null;
        this.onClearSelectionCallback = null;
        this.onRoomsDataLoadedCallback = null;
        this.roomsData = null;
        this.loadRoomsData();
    }

    /**
     * Load rooms data from JSON file
     */
    async loadRoomsData() {
        try {
            const response = await fetch('rooms.json');
            const data = await response.json();
            this.roomsData = data.rooms;
            
            // Notify callback if set
            if (this.onRoomsDataLoadedCallback) {
                this.onRoomsDataLoadedCallback(this.roomsData);
            }
        } catch (error) {
            console.error('Failed to load rooms data:', error);
            this.roomsData = [];
        }
    }

    /**
     * Get room data by ID
     * @param {String} roomId - Room ID (cleaned mesh name)
     * @returns {Object|null} - Room data object
     */
    getRoomData(roomId) {
        if (!this.roomsData) return null;
        
        // Extract just the code part (before underscore) if present
        const codeOnly = roomId.split('_')[0];
        
        return this.roomsData.find(room => room.id === codeOnly) || null;
    }

    /**
     * Initialize search UI elements
     * @param {String} dropdownId - Dropdown element ID
     * @param {String} inputId - Input element ID
     * @param {String} selectedRoomId - Selected room display element ID
     */
    initialize(dropdownId, inputId, selectedRoomId) {
        this.dropdown = document.getElementById(dropdownId);
        this.input = document.getElementById(inputId);
        this.selectedRoomDiv = document.getElementById(selectedRoomId);
        this.dropdownWrapper = document.getElementById("roomDropdownWrapper");
        this.dropdownToggle = document.getElementById("searchDropdownToggle");

        this.setupSearchDropdown();
        this.setupClearButton();
    }

    /**
     * Setup clear selection button
     */
    setupClearButton() {
        const clearBtn = document.getElementById("clearSelectionBtn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                this.clearSelection();
            });
        }
    }

    /**
     * Set zone manager for zone info display
     * @param {ZoneManager} zoneManager - Zone manager instance
     */
    setZoneManager(zoneManager) {
        this.zoneManager = zoneManager;
    }

    /**
     * Set all meshes for searching
     * @param {Array} meshes - Array of meshes
     */
    setMeshes(meshes) {
        this.allMeshes = meshes;
        this.updateDropdownOptions();
    }

    /**
     * Setup search dropdown event listeners
     */
    setupSearchDropdown() {
        // Toggle dropdown visibility on arrow click
        this.dropdownToggle.addEventListener("click", () => {
            this.toggleDropdown();
        });

        // Show dropdown when user types and filter results
        this.input.addEventListener("input", () => {
            this.updateDropdownOptions(this.input.value);
            if (this.input.value.trim() !== "") {
                this.showDropdown();
            } else {
                this.hideDropdown();
            }
        });

        // Handle room selection from dropdown - use both change and click events
        this.dropdown.addEventListener("change", () => {
            if (this.dropdown.value) {
                this.searchRoom(this.dropdown.value);
                this.hideDropdown();
            }
        });

        // Handle clicking on dropdown items
        this.dropdown.addEventListener("click", () => {
            if (this.dropdown.value) {
                this.searchRoom(this.dropdown.value);
                this.hideDropdown();
            }
        });

        // Allow Enter key to select first result or search by input text
        this.input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                if (this.dropdown.options.length > 0) {
                    this.searchRoom(this.dropdown.options[0].value);
                } else if (this.input.value.trim() !== "") {
                    // Try to find exact match by input text
                    this.searchRoom(this.input.value);
                }
                this.hideDropdown();
            }
        });
    }

    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        if (this.dropdownWrapper.style.display === "none") {
            this.showDropdown();
        } else {
            this.hideDropdown();
        }
    }

    /**
     * Show dropdown
     */
    showDropdown() {
        this.dropdownWrapper.style.display = "block";
        this.dropdownToggle.classList.add("open");
    }

    /**
     * Hide dropdown
     */
    hideDropdown() {
        this.dropdownWrapper.style.display = "none";
        this.dropdownToggle.classList.remove("open");
    }

    /**
     * Update dropdown options based on filter
     * @param {String} filter - Filter string
     */
    updateDropdownOptions(filter = "") {
        const filterLower = filter.toLowerCase();
        this.dropdown.innerHTML = "";

        const filteredMeshes = this.allMeshes
            .filter(m => m.name.toLowerCase().includes(filterLower));

        filteredMeshes.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.name;
            
            // Format display name: "Code Name" or just "Code"
            const { displayName, code } = this.formatRoomName(m.name);
            if (displayName === code) {
                opt.textContent = code;
            } else {
                opt.textContent = `${code} ${displayName}`;
            }
            
            this.dropdown.appendChild(opt);
        });

        // Adjust dropdown size based on number of results (max 6)
        const numResults = filteredMeshes.length;
        this.dropdown.size = Math.min(numResults, 6);
    }

    /**
     * Search for a room by name
     * @param {String} roomName - Room name to search
     */
    searchRoom(roomName) {
        const mesh = this.allMeshes.find(m => 
            m.name.toLowerCase() === roomName.toLowerCase()
        );
        
        if (!mesh) {
            alert("Room not found!");
            return;
        }
        
        this.selectMesh(mesh);
    }

    /**
     * Format room name for display
     * @param {String} meshName - Raw mesh name
     * @returns {Object} - Object with displayName and code
     */
    formatRoomName(meshName) {
        // Remove RL_ prefix
        let cleanName = MeshManager.cleanMeshName(meshName);
        
        // Split by underscore to separate code from name
        const parts = cleanName.split('_');
        
        if (parts.length > 1) {
            // Last part is the descriptive name, first part is the code
            const code = parts[0];
            const displayName = parts.slice(1).join(' '); // Join remaining parts
            return { displayName, code };
        } else {
            // No underscore, just return the code as both
            return { displayName: cleanName, code: cleanName };
        }
    }

    /**
     * Select and highlight a mesh
     * @param {BABYLON.Mesh} mesh - Mesh to select
     */
    selectMesh(mesh) {
        this.highlightLayer.removeAllMeshes();

        this.selectedMesh = mesh;
        this.highlightLayer.addMesh(mesh, BABYLON.Color3.Red());

        // Show the room info panel
        const roomBox = document.getElementById("roomBox");
        if (roomBox) {
            roomBox.style.display = "block";
        }

        if (this.selectedRoomDiv) {
            const cleanName = MeshManager.cleanMeshName(mesh.name);
            const roomData = this.getRoomData(cleanName);
            
            if (roomData) {
                // Use data from JSON
                const name = roomData.name;
                const code = roomData.id;
                const zone = roomData.zone;
                const floor = roomData.floor;
                const capacity = roomData.capacity;
                const description = roomData.description;
                const image = roomData.image;
                
                // Zone tag
                let zoneTag = '';
                if (zone === 'Village') {
                    zoneTag = '<span style="display: inline-block; background-color: #50C878; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; margin-top: 8px;">VILLAGE</span>';
                } else if (zone === 'Collaboration') {
                    zoneTag = '<span style="display: inline-block; background-color: #0096FF; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; margin-top: 8px;">COLLABORATION</span>';
                }
                
                // Image display
                let imageHtml = '';
                if (image) {
                    imageHtml = `<img src="${image}" alt="${name}" style="width: 100%; height: auto; border-radius: 8px; margin-top: 10px; margin-bottom: 8px;">`;
                }
                
                // Capacity display
                let capacityHtml = '';
                if (capacity) {
                    capacityHtml = `<div style="font-size: 14px; color: #0066CC; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 5px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="#0066CC" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>${capacity}</div>`;
                }
                
                // Additional info
                let additionalInfo = '';
                if (description) {
                    additionalInfo += `<div style="font-size: 12px; color: #666; margin-top: 4px;">${description}</div>`;
                }
                
                // If code only (no descriptive name), show just the code in blue
                if (name === code) {
                    this.selectedRoomDiv.innerHTML = `
                        <div style="font-size: 16px; font-weight: bold; color: #0066CC;">${code}</div>
                        ${capacityHtml}
                        ${imageHtml}
                        ${additionalInfo}
                        ${zoneTag}
                    `;
                } else {
                    // Show both name and code
                    this.selectedRoomDiv.innerHTML = `
                        <div style="font-size: 18px; font-weight: bold;">${name}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">${code}</div>
                        ${capacityHtml}
                        ${imageHtml}
                        ${additionalInfo}
                        ${zoneTag}
                    `;
                }
            } else {
                // Fallback to old method if room not found in JSON
                const { displayName, code } = this.formatRoomName(mesh.name);
                
                // Determine zone
                let zoneTag = '';
                if (this.zoneManager) {
                    if (this.zoneManager.isInVillageZone(mesh.name)) {
                        zoneTag = '<span style="display: inline-block; background-color: #50C878; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; margin-top: 8px;">VILLAGE</span>';
                    } else if (this.zoneManager.isInCollabZone(mesh.name)) {
                        zoneTag = '<span style="display: inline-block; background-color: #0096FF; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; margin-top: 8px;">COLLABORATION</span>';
                    }
                }
                
                // If code only (no descriptive name), show just the code in blue
                if (displayName === code) {
                    this.selectedRoomDiv.innerHTML = `
                        <div style="font-size: 16px; font-weight: bold; color: #0066CC;">${code}</div>
                        ${zoneTag}
                    `;
                } else {
                    // Show both name and code
                    this.selectedRoomDiv.innerHTML = `
                        <div style="font-size: 18px; font-weight: bold;">${displayName}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">${code}</div>
                        ${zoneTag}
                    `;
                }
            }
        }

        // Focus camera on selected mesh
        this.sceneManager.focusOnMesh(mesh);

        // Trigger callback if set
        if (this.onMeshSelectedCallback) {
            this.onMeshSelectedCallback(mesh);
        }
    }

    /**
     * Set callback for when mesh is selected
     * @param {Function} callback - Callback function
     */
    onMeshSelected(callback) {
        this.onMeshSelectedCallback = callback;
    }

    /**
     * Set callback for when selection is cleared
     * @param {Function} callback - Callback function
     */
    onClearSelection(callback) {
        this.onClearSelectionCallback = callback;
    }

    /**
     * Set callback for when rooms data is loaded
     * @param {Function} callback - Callback function
     */
    onRoomsDataLoaded(callback) {
        this.onRoomsDataLoadedCallback = callback;
        // If data already loaded, call immediately
        if (this.roomsData) {
            callback(this.roomsData);
        }
    }

    /**
     * Get currently selected mesh
     * @returns {BABYLON.Mesh|null}
     */
    getSelectedMesh() {
        return this.selectedMesh;
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedMesh = null;
        this.highlightLayer.removeAllMeshes();
        
        // Hide the room info panel
        const roomBox = document.getElementById("roomBox");
        if (roomBox) {
            roomBox.style.display = "none";
        }
        
        if (this.selectedRoomDiv) {
            this.selectedRoomDiv.textContent = "None";
        }
        
        // Clear input and hide dropdown
        if (this.input) {
            this.input.value = "";
        }
        this.hideDropdown();
        
        // Hide button container
        const buttonContainer = document.getElementById("buttonContainer");
        if (buttonContainer) {
            buttonContainer.style.display = "none";
        }

        // Trigger callback if set
        if (this.onClearSelectionCallback) {
            this.onClearSelectionCallback();
        }
    }
}
