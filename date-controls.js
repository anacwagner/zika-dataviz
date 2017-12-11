import React, {Component} from 'react';

export default class DateControls extends Component {

  _onValueChange(dateName, newValue) {
    const {dates, data, total} = this.props;
    // Only update if we have a confirmed change
    if (dates[dateName] !== newValue) {
      // Create a new object so that shallow-equal detects a change
      const newDates = {
        ...this.props.dates,
        [dateName]: newValue
      };

      this.props.onChange(newDates);
    }
  }

  render() {
    const {title, dates, propTypes = {}} = this.props;

    return (
      <div className="date-controls">

        {title && <h4>{title}</h4>}
        {Object.keys(dates).map(key =>
          <div key={key}>
            <label>{propTypes[key].displayName}</label>
            <div style={{display: 'inline-block', float: 'right'}}>
              {dates[key]}</div>
            <Date
              dateName={key}
              value={dates[key]}
              propType={propTypes[key]}
              onChange={this._onValueChange.bind(this)}/>
          </div>)}
      </div>
    );
  }
}

const Date = props => {
  const {propType} = props;
  if (propType && propType.type) {
    switch (propType.type) {
    case 'range':
      return <Slider {...props} />;

    case 'boolean':
      return <Checkbox {...props}/>;
    default:
      return <input {...props}/>;
    }
  }
};

const Checkbox = ({dateName, value, onChange}) => {
  return (
    <div key={dateName} >
      <div className="input-group">
        <input
          type="checkbox"
          id={dateName}
          checked={value}
          onChange={ e => onChange(dateName, e.target.checked) }/>
      </div>
    </div>
  );
};

const Slider = ({dateName, value, propType, onChange}) => {

  const {max = 100} = propType;
  const {min = 1} = propType;
  const {step = 1} = propType;

  return (

    <div key={dateName}>
      <div className="input-group" >
        <div>
          <input
            type="range"
            id={dateName}
            min={min} max={max} step={step}
            value={value}
            onChange={ e => onChange(dateName, Number(e.target.value)) }/>
        </div>
      </div>
    </div>
  );
};