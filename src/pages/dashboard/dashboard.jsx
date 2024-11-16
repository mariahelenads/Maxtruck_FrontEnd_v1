import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { getBridges } from "../../api/axios";
import "./dashboard.css";
import { Link } from "react-router-dom";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function Dashboard() {
  const mapContainer = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: "",
    height: "",
    length: "",
  });
  const [destinationName, setDestinationName] = useState("");
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [bridges, setBridges] = useState([]);
  const [map, setMap] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "destination") {
      setDestinationName(value);
    } else {
      setDimensions({ ...dimensions, [name]: value });
    }
  };

  const handleGenerateRoute = async () => {
    try {
      const coordinates = await getCoordinates(destinationName);
      if (coordinates) {
        console.log("Coordenadas encontradas:", coordinates);
        setDestinationCoordinates(coordinates);
        const safeRoute = calculateSafeRoute(dimensions, coordinates);
        if (safeRoute) {
          drawRouteOnMap(safeRoute);
        } else {
          alert("Nenhuma rota segura encontrada.");
        }
      } else {
        alert("Destino inválido ou fora de São Paulo.");
      }
    } catch (error) {
      console.error("Erro ao gerar rota:", error);
    }
  };

  const getCoordinates = async (address) => {
    try {
      const bbox = [-46.826, -24.008, -46.365, -23.356]; // Limites de São Paulo

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?` +
          `access_token=${mapboxgl.accessToken}&bbox=${bbox.join(",")}&limit=1`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        console.log(`Endereço "${address}" encontrado em:`, [lng, lat]);
        return [lng, lat];
      } else {
        console.warn(`Nenhum resultado encontrado para "${address}".`);
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
    }
    return null;
  };

  const fetchBridges = async () => {
    try {
      const response = await getBridges();
      console.log("Resposta da API:", response); 

      if (Array.isArray(response)) {
        const formattedBridges = response.map((bridge) => ({
          name: bridge.name,
          maxHeight: bridge.maxHeight,
          coordinates: [bridge.longitude, bridge.latitude],
        }));
        setBridges(formattedBridges);
      } else {
        console.error("A resposta não é um array:", response);
      }
    } catch (error) {
      console.error("Erro ao buscar pontes:", error);
    }
  };

  const calculateSafeRoute = ({ height }, destinationCoords) => {
    const safeCoordinates = [];

    for (const bridge of bridges) {
      if (height <= bridge.maxHeight) {
        safeCoordinates.push(bridge.coordinates);
      }
    }

    if (destinationCoords) {
      safeCoordinates.push(destinationCoords);
    }

    console.log("Rota segura calculada:", safeCoordinates);
    return safeCoordinates.length > 0 ? safeCoordinates : null;
  };

  const drawRouteOnMap = (routeData) => {
    if (map && routeData.length > 0) {
      const coordinates = routeData.map((coord) => [...coord]);

      map.setCenter(coordinates[0]);
      map.flyTo({ center: coordinates[0], zoom: 14, speed: 0.5 });

      if (map.getSource("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#0000FF", "line-width": 4 },
      });

      coordinates.forEach((coord) => {
        new mapboxgl.Marker().setLngLat(coord).addTo(map);
      });

      console.log("Rota desenhada no mapa.");
    } else {
      console.error("Mapa não inicializado ou dados da rota inválidos.");
    }
  };

  useEffect(() => {
    fetchBridges(); 

    if (!map) {
      mapContainer.current.innerHTML = "";

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-46.633308, -23.55052],
        zoom: 12,
      });

      setMap(mapInstance);
    }

    return () => map && map.remove();
  }, [map]);

  return (
    <div className="dashboard-container">
      <div className="form-container">
        <div className="dashboard-header">
          <h3 className="dashboard-profile">
            <Link to="/profile">Perfil</Link>
          </h3>
        </div>
        <h2>Gerar Rotas Seguras</h2>
        <input
          type="number"
          name="width"
          placeholder="Largura (m)"
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="height"
          placeholder="Altura (m)"
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="length"
          placeholder="Comprimento (m)"
          onChange={handleInputChange}
        />
        <h3>Destino</h3>
        <input
          type="text"
          name="destination"
          placeholder="Nome da Rua"
          onChange={handleInputChange}
        />
        <button onClick={handleGenerateRoute}>Gerar Rota</button>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
