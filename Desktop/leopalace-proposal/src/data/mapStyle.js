// ===================================================================
// MapLibre GL JS 用の共有スタイル定義（モック）
// APIキー不要の OpenStreetMap ラスタタイルを差し込んだ最小スタイル。
// 本番では MapTiler / 自社ベクタタイル等のスタイルURLに差し替える想定。
// 注意：MapLibre の座標順は [経度, 緯度]（Leaflet の [緯度, 経度] と逆）。
// ===================================================================

export const OSM_RASTER_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 }],
};
