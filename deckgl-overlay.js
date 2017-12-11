import React, {Component} from 'react';
import DeckGL, {ScatterplotLayer, HexagonLayer} from 'deck.gl';

// alpha component - transparency (default = 250)
const a = 180;

// ScatterplotLayer Colors
const F_COLOR = [255, 0, 128, a];
const M_COLOR = [0, 128, 255, a];

// HexagonalLayer Colors 
const HEATMAP_COLORS = [
  [65, 182, 196, a],
  [127, 205, 187, a],
  [199, 233, 180, a],
  [237, 248, 177, a],

  [255, 255, 204, a],
  [255, 237, 160, a],
  [254, 217, 118, a],
  [254, 178, 76, a],
  [253, 141, 60, a],
  [252, 78, 42, a],
  [227, 26, 28, a],
  [189, 0, 38, a],
  [128, 0, 38, a]
];

// const HEATMAP_COLORS = [
//   [28,48,107,a],
//   [8,81,156,a],
//   [33,113,181,a],
//   [66,146,198,a],
//   [107,174,214,a],
//   [158,202,225,a],
//   [198,219,239,a],
//   [222,235,247,a],
//   [247,251,255,a],

//   [255,255,204,a],
//   [255,237,160,a],
//   [254,217,118,a],
//   [254,178,76,a],
//   [253,141,60,a],
//   [252,78,42,a],
//   [227,26,28,a],
//   [189,0,38,a],
//   [128,0,38,a]
// ];

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

// const elevationRange = [0, 1000];
const elevationScale = {min: 1, max: 50};


export default class DeckGLOverlay extends Component {

  static get defaultColorRange() {
    for (var i = 0; i < HEATMAP_COLORS.length; i++){
      HEATMAP_COLORS[i].pop();
    }
    return HEATMAP_COLORS;
  }

  constructor(props) {
    super(props);
    this.startAnimationTimer = null;
    this.intervalTimer = null;
    this.state = {
      elevationScale: elevationScale.min
    };

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);

  }

  componentDidMount() {
    this._animate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.length !== this.props.data.length) {
      this._animate();
    }
  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _animate() {
    this._stopAnimate();

    // wait 1.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.setState({elevationScale: this.state.elevationScale + 1});
    }
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, data, onHover, settings} = this.props;

    if (!data) {
      return null;
    }

    const layers = [
      !settings.showHexagon ? new ScatterplotLayer({
        id: 'scatterplot',
        data,
        getPosition: d => [d[0], d[1]],
        getColor: d => d[5] === 'M' ? M_COLOR : F_COLOR,
        getRadius: d => 1,
        opacity: 0.5,
        pickable: true,
        onHover,
        radiusScale: settings.radiusScale,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 30
      }) : null,
      settings.showHexagon ? new HexagonLayer({
        id: 'heatmap',
        colorRange: HEATMAP_COLORS,
        coverage: settings.coverage,
        data,
        elevationRange: [0, settings.elevationUpperPercentile],
        elevationScale: this.state.elevationScale,
        extruded: settings.extruded,  // to enable hexagon elevation (based on number of points in each bin)
        getColorValue: points => points.length,
        getPosition: d => [d[0], d[1]],
        //colorDomain: [0,700],
        //elevationDomain: [0, 700],
        lightSettings: LIGHT_SETTINGS,
        onHover,
        opacity: 1,
        pickable: true,
        radius: settings.radius,
        upperPercentile: settings.upperPercentile
      }) : null
    ];

    return <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />;
  }
}
