# SunLife Metaverse - Modular Structure

This project has been refactored into modular, maintainable files for better organization and scalability.

## File Structure

### Core Application Files

- **app.js** - Main application orchestrator
  - Coordinates all manager classes
  - Handles application initialization and lifecycle
  - Sets up event listeners and UI interactions

### Manager Modules

- **meshManager.js** - Mesh utilities and processing
  - Merges primitive meshes with the same base name
  - Filters meshes by prefix
  - Cleans mesh names for display

- **sceneManager.js** - Scene and camera management
  - Creates and configures the 3D scene
  - Manages camera setup and controls
  - Handles camera animations (focus, reset, top-down view)
  - Auto-adjusts camera to view entire scene

- **navigationManager.js** - Navigation and pathfinding
  - Initializes Recast navigation plugin
  - Creates navigation mesh from scene geometry
  - Manages crowd and agent movement
  - Computes and visualizes paths
  - Handles agent position updates

- **zoneManager.js** - Zone filtering and highlighting
  - Defines collaborative and village zones
  - Sets up zone filter checkboxes
  - Manages zone-based mesh highlighting
  - Provides zone membership checks

- **searchManager.js** - Room search and selection
  - Manages search dropdown and input
  - Filters rooms based on user input
  - Handles mesh selection and highlighting
  - Coordinates with camera for focusing on selected rooms

### UI Files

- **index.html** - Main HTML structure
- **style.css** - Styling and layout

## How It Works

1. **Initialization**: When the page loads, `app.js` creates a new `SunLifeMetaverse` instance
2. **Manager Setup**: The main app creates instances of all manager classes
3. **Scene Loading**: The 3D model is loaded and processed using manager utilities
4. **User Interaction**: Each manager handles its specific domain (search, navigation, zones, etc.)

## Benefits of Modular Structure

✅ **Maintainability** - Each file has a single, clear responsibility  
✅ **Readability** - Smaller, focused files are easier to understand  
✅ **Reusability** - Manager classes can be reused in other projects  
✅ **Testability** - Individual modules can be tested independently  
✅ **Collaboration** - Multiple developers can work on different files  
✅ **Scalability** - Easy to add new features without bloating existing code  

## Making Changes

- **To modify camera behavior**: Edit `sceneManager.js`
- **To change navigation logic**: Edit `navigationManager.js`
- **To update zone definitions**: Edit `zoneManager.js`
- **To adjust search functionality**: Edit `searchManager.js`
- **To add mesh processing utilities**: Edit `meshManager.js`
- **To modify overall app flow**: Edit `app.js`

## Dependencies

The scripts must be loaded in this order (already configured in index.html):
1. Babylon.js core libraries
2. Recast.js (navigation)
3. Manager modules (meshManager, sceneManager, navigationManager, zoneManager, searchManager)
4. Main app (app.js)
