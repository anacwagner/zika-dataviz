/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import ControlPanel from './control-panel';
import LayerControls from './layer-controls';
import DateControls from './date-controls';

import {readableInteger} from './utils/format-utils';


import {json as requestJSON, csv as requestCSV} from 'd3-request';



const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG1veGhheSIsImEiOiJjajB0YzM0cXIwMDF6MzNtZHdyZ3J4anFhIn0.FSi3dh1eb4vVOGMtI9ONJA';

const ZIKA_DATA = './data/zika_geo_data.csv'; 

const colorRamp = DeckGLOverlay.defaultColorRange.slice().map(color => `rgb(${color.join(',')})`);


const LAYER_CONTROLS = {
  showHexagon: {
    displayName: 'Show Hexagon',
    type: 'boolean',
    value: true
  },
  radius: {
    displayName: 'Hexagon Radius',
    type: 'range',
    value: 350,
    step: 100,
    min: 50,
    max: 2000
  },
  coverage: {
    displayName: 'Coverage',
    type: 'range',
    value: 0.7,
    step: 0.1,
    min: 0,
    max: 1
  },
  upperPercentile: {
    displayName: 'Upper Percentile',
    type: 'range',
    value: 100,
    step: 0.1,
    min: 80,
    max: 100
  },
  elevationUpperPercentile: {
    displayName: 'Elevation',
    type: 'range',
    value: 1000,
    step: 100,
    min: 0,
    max: 1000
  },
  extruded: {
    displayName: 'Extruded',
    type: 'boolean',
    value: true
  },
  radiusScale: {
    displayName: 'Scatterplot Radius',
    type: 'range',
    value: 88,
    step: 10,
    min: 10,
    max: 200
  }
};

const DATE_CONTROLS = {
  accumulated: {
    displayName: 'Acumulado',
    type: 'boolean',
    value: true
  },
  woman: {
    displayName: 'Mulheres',
    type: 'boolean',
    value: true
  },
  man: {
    displayName: 'Homens',
    type: 'boolean',
    value: true
  },
  year: {
    displayName: 'ANO',
    type: 'range',
    value: 2015,
    step: 1,
    min: 2015,
    max: 2016
  },
  month: {
    displayName: 'MÊS',
    type: 'range',
    value: 1,
    step: 1,
    min: 1,
    max: 12
  }
};


class Root extends Component {

  constructor(props) {
    super(props);

    this.startAnimationTimer = null;
    this.intervalTimer = null;

    this.state = {

      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        longitude: -43.3627,
        latitude: -22.7910,
        zoom: 9.9,
        minZoom: 5,
        maxZoom: 15,
        pitch: 40.5,
        bearing: -27.396674584323023
      },

      dates: Object.keys(DATE_CONTROLS).reduce((accu, key) => ({
        ...accu,
        [key]: DATE_CONTROLS[key].value
      }), {}),

      data: null,
      newData: null,
      total: null,
      newTotal: null,

      settings: Object.keys(LAYER_CONTROLS).reduce((accu, key) => ({
        ...accu,
        [key]: LAYER_CONTROLS[key].value
      }), {}),

      // HoverInfo
      x: 0,
      y: 0,
      hoveredObject: null
    };

    this._startAnimate = this._startAnimate.bind(this);
    this._animateDate = this._animateDate.bind(this);

    requestCSV(ZIKA_DATA, (error, response) => {
      if (!error) {
        const data = response.map(d => ([Number(d.longitude), Number(d.latitude), Number(d.ano), Number(d.mes), Number(d.semana), d.sexo]));
        const total = data.length;

        const newData = data.filter((d) => (d[2] <= this.state.dates.year && d[3] <= this.state.dates.month));
        const newTotal = newData.length;
        this.setState({data,total, newData, newTotal});
      }
    });
  }

  componentDidMount() {
    // when component mounts to process the data
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize.bind(this));
  }

  updateLayerSettings(settings) {
    this.setState({settings});
  }

  updateDates(dates) {
    this.setState({dates});

    const {data} = this.state;

    if (dates.woman && dates.man){
      if (dates.accumulated){
        const newData = data.filter((d) => (d[2] <= dates.year && d[3] <= dates.month));
        const newTotal = newData.length;
        this.setState({newData, newTotal});
      } else {
          const newData = data.filter((d) => (d[2] === dates.year && d[3] === dates.month));
          const newTotal = newData.length;
          this.setState({newData, newTotal});
      }

    } else {
      if (dates.woman){
        if (dates.accumulated){
          const newData = data.filter((d) => (d[5] === 'F' && d[2] <= dates.year && d[3] <= dates.month));
          const newTotal = newData.length;
          this.setState({newData, newTotal});
        } else {
          const newData = data.filter((d) => (d[5] === 'F' && d[2] === dates.year && d[3] === dates.month));
          const newTotal = newData.length;
          this.setState({newData, newTotal});
        }
      } else {
        if (dates.man){
          if (dates.accumulated){
            const newData = data.filter((d) => (d[5] === 'M' && d[2] <= dates.year && d[3] <= dates.month));
            const newTotal = newData.length;
            this.setState({newData, newTotal});
          } else {
            const newData = data.filter((d) => (d[5] === 'M' && d[2] === dates.year && d[3] === dates.month));
            const newTotal = newData.length;
            this.setState({newData, newTotal});
          }
        } else {
          const newData = null;
          const newTotal = 0;
          this.setState({newData, newTotal});
        } 
      }
    }
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;

    if (!hoveredObject) {
      return null;
    }
    const lat = hoveredObject.centroid[1];
    const lng = hoveredObject.centroid[0];
    const count = hoveredObject.points.length;

    return (
      <div className="tooltip"
           style={{left: x, top: y}}>
        <div>{`latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}`}</div>
        <div>{`longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}`}</div>
        <div>{`${count} Casos Notificados`}</div>
      </div>
    );
  }

  // updated viewport every time the user interacts with the map
  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  //  a resize handler that updates our viewport with the new dimension
  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _animate() {
    this._stopAnimate();

    // wait 0.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateDate, 1000);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateDate() {
    const {data, dates} = this.state;

    if (dates.month < 12){
      dates.month = dates.month + 1;
      this.setState(dates);
    } else{
      if (dates.year === 2015){
        dates.year = 2016;
      } else {
        dates.year = 2015;
      }
      dates.month = 1;
      this.setState(dates);
    }

    if (dates.woman && dates.man){
      if (dates.accumulated){
        const newData = data.filter((d) => (d[2] <= dates.year && d[3] <= dates.month));
        const newTotal = newData.length;
        this.setState({newData, newTotal});
      } else {
          const newData = data.filter((d) => (d[2] === dates.year && d[3] === dates.month));
          const newTotal = newData.length;
          this.setState({newData, newTotal});
      }

    } else {
      if (dates.woman){
        if (dates.accumulated){
          const newData = data.filter((d) => (d[5] === 'F' && d[2] <= dates.year && d[3] <= dates.month));
          const newTotal = newData.length;
          this.setState({newData, newTotal});
        } else {
          const newData = data.filter((d) => (d[5] === 'F' && d[2] === dates.year && d[3] === dates.month));
          const newTotal = newData.length;
          this.setState({newData, newTotal});
        }
      } else {
        if (dates.man){
          if (dates.accumulated){
            const newData = data.filter((d) => (d[5] === 'M' && d[2] <= dates.year && d[3] <= dates.month));
            const newTotal = newData.length;
            this.setState({newData, newTotal});
          } else {
            const newData = data.filter((d) => (d[5] === 'M' && d[2] === dates.year && d[3] === dates.month));
            const newTotal = newData.length;
            this.setState({newData, newTotal});
          }
        } else {
          const newData = null;
          const newTotal = 0;
          this.setState({newData, newTotal});
        } 
      }
    }

  }


  render() {
    const {viewport, settings, data, dates, total} = this.state;

    const {newData, newTotal} = this.state;


    return (
      <div>

        {this._renderTooltip()}

        <MapGL
          {...viewport}
          // Callback for viewport changes, addressed below
          onViewportChange={this._onViewportChange.bind(this)}
          mapStyle={MAPBOX_STYLE}
          // This is needed to use mapbox styles
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <DeckGLOverlay
            viewport={viewport}
            data={newData || []}
            onHover={this._onHover.bind(this)}
            settings={settings}
            dates={dates}/>
        </MapGL>

        <LayerControls
          settings={settings}
          propTypes={LAYER_CONTROLS}
          onChange={this.updateLayerSettings.bind(this)}/>

        <div className="options-panel">
          <h1>Zika Vírus</h1>
          <h3>Casos Notificados de Zika entre 2015 e 2016 </h3>
          <p>O mapa mostra a distribuição do vírus no município do Rio de Janeiro.</p>
          <p> 
          A área de cada agrupamento hexagonal é de <b>{Math.round((3*settings.radius**2*Math.sqrt(3))/2)}</b> metros quadrados.
          </p>

          <div className="layout">
          {colorRamp.map((c, i) => (
            <div key={i}
              className="legend"
              style={{background: c, width: `${100 / colorRamp.length}%`}} />
          ))}
          </div>

          <p className="layout">
            <span className="col-1-2">POUCAS NOTIFICAÇÕES</span>
            <span className="text-right">MUITAS NOTIFICAÇÕES</span>
          </p>

          <div className="layout">
            <div className="stat col-1-2">
              TOTAL SELECIONADO<b>{readableInteger(newTotal)}</b>
            </div>
            <div className="stat col-1-2">
              TOTAL DATASET <b>{readableInteger(total)}</b>
            </div>
          </div>
          <hr />

          <DateControls
            dates={dates}
            propTypes={DATE_CONTROLS}
            onChange={this.updateDates.bind(this)}/>

          <hr/>

          <div className="layout">
            <button className="stat col-1-2"
              onClick = {this._animate.bind(this)}> 
            Start Animation </button>
            <button className="stat col-1-2"
              onClick = {this._stopAnimate.bind(this)}> 
            Stop Animation </button>
          </div>

        </div>
      </div>
    );
  }
}

// returns a hierarchy of views to display
render(<Root />, document.body.appendChild(document.createElement('div')));
