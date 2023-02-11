const INPUTS = Array.from(document.querySelectorAll('input'));

// create ambient light source
const ambientLight = new deck.AmbientLight({
  color: [255, 255, 255],
  intensity: 3.0
});

// create directional light source
const directionalLight = new deck.DirectionalLight({
  color: [255, 255, 255],
  intensity: 9.0,
  direction: [-3, -9, -1]
});

const deckgl = new deck.DeckGL({
  initialViewState: {
    latitude: 35.6812405,
    longitude: 139.7649361,
    zoom: 16,
    bearing: 0,
    pitch: 30,
  },
  controller: true,
  effects: [
    new deck.LightingEffect({ ambientLight, directionalLight })
  ],
  layers: [
    new deck.Tile3DLayer({
      id: "tile3dlayer",
      pointSize: 1,
      data: 'https://plateau.geospatial.jp/main/data/3d-tiles/bldg/13100_tokyo/13101_chiyoda-ku/low_resolution/tileset.json', // 千代田区
      loader: Tiles3DLoader,
      opacity: 1,
      pickable: true,
      onTileLoad: d => {
        const { content } = d;
        const buffer = content.batchTableBinary.buffer;
        const key = content.batchTableJson;
        const len = key._gml_id.length;
        const zMinView = new DataView(buffer, key._zmin.byteOffset, len * 8);
        const zMins = [];

        for (let i = 0; i < len; i++) {
          zMins.push(zMinView.getFloat64(i * 8, true));
        }
        zMins.sort((a, b) => a - b);
        content.cartographicOrigin.z -= 36.6641 + zMins[Math.floor(len / 2)];
      }
    }),
    new deck.TileLayer({
      data: "https://gic-plateau.s3.ap-northeast-1.amazonaws.com/2020/ortho/tiles/{z}/{x}/{y}.png",
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: props => new deck.BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: (({ west, south, east, north }) => [west, south, east, north])(props.tile.bbox),
      }),
    })
  ]
});

redraw();

INPUTS.forEach(el => {
  el.oninput = redraw;
});

function redraw() {
  const settings = {};
  INPUTS.forEach(el => {
    const name = el.id;
    const value = +el.value;
    settings[name] = value;
    document.getElementById(name + '-value').innerHTML = value;
  });

  ambientLight.intensity = settings.ambientLight;
  directionalLight.intensity = settings.directionalLight;

  deckgl.redraw(true);
}