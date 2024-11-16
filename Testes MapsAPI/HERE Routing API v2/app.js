// Adicionar inputs e botão ao HTML
document.body.innerHTML += `
    <div class="dashboard-container" style="width: 90%; max-width: 800px; margin: 20px auto; padding: 20px; background-color: #faf3e0;">
        <div class="form-container" style="margin-bottom: 20px;">
            <div class="dashboard-header" style="text-align: right;">
                <h3 class="dashboard-profile" style="margin: 0;"><a href="#" style="text-decoration: none; color: #333;">Perfil</a></h3>
            </div>
            <h2 style="margin-bottom: 10px;">Gerar Rotas Seguras</h2>
            <input type="number" id="widthInput" placeholder="Largura (m)" style="width: 100%; padding: 10px; margin: 10px 0;">
            <input type="number" id="heightInput" placeholder="Altura (m)" style="width: 100%; padding: 10px; margin: 10px 0;">
            <input type="number" id="lengthInput" placeholder="Comprimento (m)" style="width: 100%; padding: 10px; margin: 10px 0;">
            <h3 style="margin: 10px 0;">Destino</h3>
            <input type="text" id="destinationInput" placeholder="Nome da Rua" style="width: 100%; padding: 10px; margin: 10px 0;">
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

// Definir o serviço de roteamento
var router = platform.getRoutingService(null, 8);

// Função para lidar com alterações nos inputs
function handleInputChange() {
    var width = document.getElementById('widthInput').value;
    var height = document.getElementById('heightInput').value;
    var length = document.getElementById('lengthInput').value;
    var destination = document.getElementById('destinationInput').value;

    // Atualizar os parâmetros do caminhão
    return {
        'routingMode': 'fast',
        'transportMode': 'truck',
        'origin': '-23.5505,-46.6333', // Coordenadas de origem (São Paulo)
        'destination': destination ? destination : '-23.6275,-46.7171', // Coordenadas de destino
        'return': 'polyline,turnByTurnActions,actions,instructions,travelSummary',
        'vehicle': {
            'grossWeight': width ? parseInt(width) * 1000 : 12000, // Peso bruto do caminhão em kg
            'height': height ? parseInt(height) * 100 : 400 // Altura do caminhão em cm
        }
    };
}

// Calcular a rota
function calculateRoute() {
    var routingParameters = handleInputChange();
    router.calculateRoute(routingParameters, onResult, onError);
}

document.getElementById('generateRouteButton').addEventListener('click', function() {
    calculateRoute();
});

function onResult(result) {
    if (result.routes.length) {
        var route = result.routes[0];

        // Remover a rota anterior, se houver
        map.getObjects().forEach(function (object) {
            if (object instanceof H.map.Polyline) {
                map.removeObject(object);
            }
        });

        // Criar a linha que vai representar a rota
        var routeShape = route.sections[0].polyline;
        var linestring = H.geo.LineString.fromFlexiblePolyline(routeShape);

        var routeLine = new H.map.Polyline(linestring, {
            style: { strokeColor: 'blue', lineWidth: 4 }
        });

        // Adicionar a rota no mapa
        map.addObject(routeLine);

        // Ajustar o mapa para mostrar a rota completa
        map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
    }
}

function onError(error) {
    console.error('Erro ao calcular a rota:', error);
}
