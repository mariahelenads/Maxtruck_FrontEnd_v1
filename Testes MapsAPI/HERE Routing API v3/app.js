// Adicionar inputs e botão ao HTML
document.body.innerHTML += `
    <div class="dashboard-container" style="width: 90%; max-width: 800px; margin: 20px auto; padding: 20px; background-color: #faf3e0;">
        <div class="form-container" style="margin-bottom: 20px;">
            <div class="dashboard-header" style="text-align: right;">
                <h3 class="dashboard-profile" style="margin: 0;"><a href="#" style="text-decoration: none; color: #333;">Perfil</a></h3>
            </div>
            <h2 style="margin-bottom: 10px;">Calcule sua rota com segurança!</h2>
            <input type="text" id="originInput" placeholder="Ponto de Partida" style="width: 100%; padding: 10px; margin: 10px 0;">
            <input type="text" id="destinationInput" placeholder="Ponto de Chegada" style="width: 100%; padding: 10px; margin: 10px 0;">
            <input type="number" id="heightInput" placeholder="Altura do Caminhão (m)" style="width: 100%; padding: 10px; margin: 10px 0;">
            <input type="number" id="grossWeightInput" placeholder="Peso Bruto do Caminhão (kg)" style="width: 100%; padding: 10px; margin: 10px 0;">
            <button id="generateRouteButton" style="width: 100%; padding: 10px; background-color: #20b2aa; color: white; border: none; border-radius: 4px; cursor: pointer;">Gerar Rota</button>
        </div>
        <div id="mapContainer" style="width: 100%; height: 400px; border: 1px solid #ccc;"></div>
    </div>
`;

// Inicializar a plataforma HERE
var platform = new H.service.Platform({
    apikey: 'KzJwxn4fXhBgG3pKHuSjVILKqqQBa6dqldJ683xYKpo' // Substitua pela sua chave de API
});

// Definir as opções do mapa
var defaultLayers = platform.createDefaultLayers();

// Inicializar o mapa
var map = new H.Map(
    document.getElementById('mapContainer'), // ID do container do mapa
    defaultLayers.vector.normal.map, // Camada padrão do mapa
    {
        zoom: 12, // Nível de zoom inicial
        center: { lat: -23.5505, lng: -46.6333 } // Localização inicial (São Paulo)
    }
);

// Ativar interações no mapa (zoom, arrastar)
var mapEvents = new H.mapevents.MapEvents(map);
var behavior = new H.mapevents.Behavior(mapEvents);

// Adicionar controles ao mapa
var ui = H.ui.UI.createDefault(map, defaultLayers);

// Função para geocodificar endereços em coordenadas
async function geocodeAddress(address) {
    const response = await fetch(`https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=KzJwxn4fXhBgG3pKHuSjVILKqqQBa6dqldJ683xYKpo`);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
        return {
            lat: data.items[0].position.lat,
            lng: data.items[0].position.lng
        };
    } else {
        throw new Error('Endereço não encontrado: ' + address);
    }
}

// Função para calcular a rota
async function calculateRoute() {
    try {
        var originAddress = document.getElementById('originInput').value;
        var destinationAddress = document.getElementById('destinationInput').value;
        var height = document.getElementById('heightInput').value;
        var grossWeight = document.getElementById('grossWeightInput').value;

        // Geocodificar endereços
        const origin = await geocodeAddress(originAddress);
        const destination = await geocodeAddress(destinationAddress);

        // Configurar parâmetros da rota
        const routingParameters = {
            'origin': `${origin.lat},${origin.lng}`,
            'destination': `${destination.lat},${destination.lng}`,
            'return': 'polyline',
            'spans': 'notices',
            'transportMode': 'truck',
            'vehicle[grossWeight]': grossWeight ? parseInt(grossWeight) : 12000,
            'vehicle[height]': height ? parseInt(height) * 100 : 400,
            'departureTime': '2021-11-01T10:00:00',
            'apiKey': 'KzJwxn4fXhBgG3pKHuSjVILKqqQBa6dqldJ683xYKpo'
        };

        // Fazer a solicitação para a API de rotas HERE
        const queryString = new URLSearchParams(routingParameters).toString();
        const routeResponse = await fetch(`https://router.hereapi.com/v8/routes?${queryString}`);
        const routeData = await routeResponse.json();

        if (routeData.routes && routeData.routes.length > 0) {
            const route = routeData.routes[0];
            const routeShape = route.sections[0].polyline;
            const linestring = H.geo.LineString.fromFlexiblePolyline(routeShape);

            // Remover rota anterior, se houver
            map.getObjects().forEach(function (object) {
                if (object instanceof H.map.Polyline) {
                    map.removeObject(object);
                }
            });

            // Criar a linha que vai representar a rota
            const routeLine = new H.map.Polyline(linestring, {
                style: { strokeColor: 'blue', lineWidth: 4 }
            });

            // Adicionar a rota no mapa
            map.addObject(routeLine);

            // Ajustar o mapa para mostrar a rota completa
            map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
        } else {
            alert('Nenhuma rota encontrada.');
        }
    } catch (error) {
        console.error('Erro ao calcular a rota:', error);
        alert('Erro ao calcular a rota: ' + error.message);
    }
}

document.getElementById('generateRouteButton').addEventListener('click', function() {
    calculateRoute();
});
