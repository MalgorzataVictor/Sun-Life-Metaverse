// Recommended Rooms Banner Management

class RecommendedRoomsManager {
    constructor(roomsData, searchManager) {
        this.roomsData = roomsData;
        this.searchManager = searchManager;
        this.recommendedRoomIds = ['01W095', '01W063', '01W068', '01S005']; // Viking, Dunmore, Greenway, Techbar
    }

    /**
     * Initialize recommended rooms banner
     */
    initialize() {
        const banner = document.getElementById('recommendedRoomsBanner');
        if (!banner) return;

        // Clear existing content
        banner.innerHTML = '';

        // Create panels for each recommended room
        this.recommendedRoomIds.forEach(roomId => {
            const roomData = this.getRoomData(roomId);
            if (roomData) {
                const panel = this.createRoomPanel(roomData);
                banner.appendChild(panel);
            }
        });
    }

    /**
     * Get room data by ID
     * @param {String} roomId - Room ID
     * @returns {Object|null} - Room data
     */
    getRoomData(roomId) {
        if (!this.roomsData) return null;
        return this.roomsData.find(room => room.id === roomId) || null;
    }

    /**
     * Create a room panel
     * @param {Object} roomData - Room data object
     * @returns {HTMLElement} - Panel element
     */
    createRoomPanel(roomData) {
        const panel = document.createElement('div');
        panel.className = 'recommended-room-panel';
        
        const imageSrc = roomData.image || 'assets/default_room.png';
        panel.innerHTML = `
            <div class="room-panel-image-container">
                <img src="${imageSrc}" alt="${roomData.name}" class="room-panel-image">
                <div class="room-panel-name-overlay">
                    <div class="room-panel-name">${roomData.name}</div>
                </div>
                <div class="room-panel-overlay">
                    <div class="room-panel-code">${roomData.id}</div>
                    <div class="room-panel-capacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        ${roomData.capacity || 'N/A'}
                    </div>
                </div>
            </div>
        `;

        // Add click handler to select the room
        panel.addEventListener('click', () => {
            this.selectRoom(roomData.id);
        });

        return panel;
    }

    /**
     * Select a room by ID
     * @param {String} roomId - Room ID
     */
    selectRoom(roomId) {
        const scene = this.searchManager.sceneManager.scene;
        
        // Try to find mesh by ID or by ID_Name pattern
        let mesh = scene.getMeshByName('RL_' + roomId);
        
        // If not found, search for meshes that start with RL_roomId
        if (!mesh) {
            mesh = scene.meshes.find(m => 
                m.name && m.name.startsWith('RL_' + roomId)
            );
        }
        
        if (mesh) {
            this.searchManager.selectMesh(mesh);
        }
    }

    /**
     * Update rooms data when loaded
     * @param {Array} roomsData - Rooms data array
     */
    updateRoomsData(roomsData) {
        this.roomsData = roomsData;
        this.initialize();
    }
}
