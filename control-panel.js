import React, {PureComponent} from 'react';

const camelPattern = /(^|[A-Z])[a-z]*/g;

const defaultContainer =  ({children}) => <div className="control-panel">{children}</div>;

export default class ControlPanel extends PureComponent {

  render() {
    const Container = this.props.containerComponent || defaultContainer;
    const {settings} = this.props;

    return (
      <Container>
        <h3>Casos Notificados de Zika em <b>{settings.year}</b> </h3>
        <p>O mapa mostra o espalhamento do vírus no município do Rio de Janeiro</p>
        <p>Data source: <a href="http://portalsinan.saude.gov.br/sinan-dengue-chikungunya">SINAN</a></p>
        <hr />

        <div key={name} className="input">
          <label>Year</label>
          <input type="range" value={settings.year}
            min={2015} max={2016} step={1}
            onChange={evt => this.props.onChange('year', evt.target.value)} />
        </div>
      </Container>
    );
  }
}

// export default class ControlPanel extends PureComponent {

//   _formatSettingName(name) {
//     return name.match(camelPattern).join(' ');
//   }

//   _renderCheckbox(name, value) {
//     return (
//       <div key={name} className="input">
//         <label>{this._formatSettingName(name)}</label>
//         <input type="checkbox" checked={value}
//           onChange={evt => this.props.onChange(name, evt.target.checked)} />
//       </div>
//     );
//   }

//   _renderNumericInput(name, value) {
//     return (
//       <div key={name} className="input">
//         <label>{this._formatSettingName(name)}</label>
//         <input type="number" value={value}
//           onChange={evt => this.props.onChange(name, Number(evt.target.value))} />
//       </div>
//     );
//   }

//   _renderRange(name, value, min, max, step) {
//     return (
//       <div key={name} className="input">
//         <label>{this._formatSettingName(name)}</label>
//         <input type="range" value={value} min={min} max={max} step={1}
//           onChange={evt => this.props.onChange(name, evt.target.value)} />
//       </div>
//     );
//   }

//   _renderSetting(name, value) {
//     switch (typeof value) {
//     case 'boolean':
//       return this._renderCheckbox(name, value);
//     case 'number':
//       return this._renderNumericInput(name, value);
//     default:
//       return null;
//     }
//   }

//   render() {
//     const Container = this.props.containerComponent || defaultContainer;
//     const {settings} = this.props;

//     return (
//       <Container>
//         <h3>Casos Notificados de Zika em <b>{settings.year}</b> </h3>
//         <p>O mapa mostra o espalhamento do vírus no município do Rio de Janeiro</p>
//         <div className="source-link">
//           <a href="http://portalsinan.saude.gov.br/sinan-dengue-chikungunya" target="_new">SINAN ↗</a>
//         </div>
//         <hr />

//         { Object.keys(settings).map(name => this._renderSetting(name, settings[name])) }
//       </Container>
//     );
//   }
// }