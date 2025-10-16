# Envirozone Web Application

## Overview

Envirozone is a React-based web application designed to visualize GeoJSON data on an interactive map. It provides a user-friendly interface for exploring geographical features, filtering data, and interacting with map elements. The app is styled with Tailwind CSS and includes custom animations and styles for an enhanced user experience.

---

## Key Features

### 1. **File Upload and GeoJSON Parsing**
   - Users can upload a GeoJSON file.
   - The app validates and normalizes the GeoJSON data.
   - Extracts a list of features (e.g., points, polygons) from the GeoJSON file.

### 2. **Feature List and Filtering**
   - Displays a list of features extracted from the GeoJSON file in the sidebar.
   - Users can filter the feature list using a search bar.
   - Filtering supports partial matches for feature names or IDs.

### 3. **Interactive Map**
   - Visualizes GeoJSON data on a map using the `MapView` component.
   - Highlights the selected feature on the map.
   - Allows users to click on map elements to select features.

### 4. **Responsive Design**
   - Fully responsive layout that adapts to different screen sizes.
   - Uses Tailwind CSS for styling and dark mode support.

### 5. **Custom Animations and Styles**
   - Includes animations like `fadeInUp` and `pulseGlow` for a polished UI.
   - Custom scrollbar and Leaflet map control styling.

---

## UI Components

### 1. **Header**
   - **Functionality**: Displays the total number of features available in the uploaded GeoJSON file. Includes a search bar that allows users to filter the feature list dynamically.
   - **Placement**: Positioned at the top of the application as a fixed header.
   - **Working**:
     - The `featureCount` prop dynamically updates to reflect the total number of features.
     - The `filterTerm` prop binds to the search bar input, enabling real-time filtering.
     - The `onFilterChange` callback is triggered whenever the search term changes, updating the filtered feature list in the sidebar.

### 2. **Sidebar**
   - **Functionality**: Displays a scrollable list of features extracted from the GeoJSON file. Allows users to upload a new GeoJSON file and select features from the list.
   - **Placement**: Positioned on the left side of the application as a collapsible sidebar.
   - **Working**:
     - The `features` prop provides the filtered list of features to display.
     - The `selectedId` prop highlights the currently selected feature in the list.
     - The `onSelect` callback is triggered when a user clicks on a feature, updating the selected feature in the state.
     - The `onFileLoad` callback handles the GeoJSON file upload, validating and normalizing the data before updating the state.
     - The `totalFeatures` prop displays the total number of features at the top of the sidebar.

### 3. **MapView**
   - **Functionality**: Renders the GeoJSON data on an interactive map. Highlights the selected feature and allows users to interact with map elements.
   - **Placement**: Occupies the main content area of the application, to the right of the sidebar.
   - **Working**:
     - The `geojson` prop provides the normalized GeoJSON data to render on the map.
     - The `selectedId` prop highlights the currently selected feature on the map.
     - The `onSelectFeature` callback is triggered when a user clicks on a map element, updating the selected feature in the state.
     - The map supports zooming, panning, and clicking on features for better interactivity.

---

## Code Structure

### 1. **State Management**
   - `geojson`: Stores the normalized GeoJSON data.
   - `featureList`: Stores the list of features extracted from the GeoJSON file.
   - `selectedId`: Tracks the currently selected feature.
   - `filterTerm`: Tracks the search term for filtering features.

### 2. **Key Utility Functions**
   - `normalizeGeoJSON`: Normalizes the GeoJSON data for consistent processing.
   - `extractFeatureList`: Extracts a list of features (ID and name) from the GeoJSON data.

### 3. **Custom Styles**
   - Custom scrollbar styles for better aesthetics.
   - Leaflet map controls styled with gradients and shadows.
   - Animations for smooth transitions and glowing effects.

---

## How to Run the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd Envirozone
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open the app in your browser at `http://localhost:3000`.

---

## Future Enhancements

- Add support for additional GeoJSON feature types.
- Implement advanced filtering options (e.g., by feature properties).
- Add the ability to edit GeoJSON features directly on the map.

---

## Notes for Knowledge Transfer (KT)

- **Component Communication**: The app uses props to pass data and callbacks between components.
- **State Updates**: State is managed using React's `useState` and `useMemo` hooks.
- **Styling**: Tailwind CSS is used extensively for styling, with some custom CSS for specific elements.
- **Error Handling**: Basic error handling is implemented for invalid GeoJSON files.
- **Extensibility**: The app is designed to be modular, making it easy to add new features or components.

