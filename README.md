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
   - Displays the total number of features.
   - Includes a search bar for filtering features.
   - Props:
     - `featureCount`: Total number of features.
     - `filterTerm`: Current search term.
     - `onFilterChange`: Callback to update the search term.

### 2. **Sidebar**
   - Lists all features extracted from the GeoJSON file.
   - Highlights the currently selected feature.
   - Allows users to upload a new GeoJSON file.
   - Props:
     - `features`: Array of filtered features.
     - `selectedId`: ID of the currently selected feature.
     - `onSelect`: Callback to update the selected feature.
     - `onFileLoad`: Callback to handle GeoJSON file upload.
     - `totalFeatures`: Total number of features.

### 3. **MapView**
   - Renders the GeoJSON data on an interactive map.
   - Highlights the selected feature.
   - Props:
     - `geojson`: Normalized GeoJSON data.
     - `selectedId`: ID of the currently selected feature.
     - `onSelectFeature`: Callback to update the selected feature.

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

