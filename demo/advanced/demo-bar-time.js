import { LitElement, html } from 'lit-element';
// import { timeData } from '../demo-utils.js';
import { randomUniform } from 'd3-random';

import * as scales from 'd3-scale';
import * as format from 'd3-format';
import {timeFormat} from 'd3-time-format';
import * as time from 'd3-time';

export const rnd = (keys, max) => {
  var r = randomUniform(max);
  return keys.map(function(d, i) {
    return { key: d, value: { count: r() } };
  });
}

const timeData = (nbDays) => {
    const now = new Date();
    const range = time.timeDay.range(time.timeDay.offset(now, -nbDays), now, 1);
    return rnd(range, 10);
}

class Chart extends LitElement {

  render() {
    return html `
    <p>Example of a bar chart with a time scale</p>

    <label>scale padding</label><input  type="number" step="0.1" .value="${this.padding}" @input=${(e) => {this.padding = e.currentTarget.value *1;}}>  
    <label>right margin</label><input  type="number" .value="${this.rightMargin}" @input=${(e) => {this.rightMargin = e.currentTarget.value *1;}}>  
    <div>
      <label>time format</label><input .value="${this.timeFormat}" @input=${(e) => {this.timeFormat = e.currentTarget.value}}> , as per https://github.com/d3/d3-time-format#d3-time-format
    </div>

    <multi-chart-bar
        id="chart" 
        bottom-axis
        left-axis
        left-ticks="2"
        bottom-ticks="3"
        .leftTickFormat="${this.format}"
        .bottomPadding="${this.padding}"
        bottom-scale-type="time"
        .bottomTickFormat="${timeFormat(this.timeFormat)}"
        .ordinalScaleInterval="${this.scaleInterval}"
        .data="${this.data}"
        .log="${this.log}"
        .keys="${this.keys}"
        .keyAccessor="${this.keyAccessor}"
        .value="${this.value}"
        .rightMargin="${this.rightMargin}"
        .colorScale="${this.colorScale}"
        >
        <h3 slot="header">time serie</h3>
        <multi-legend .scale="${this.colorScale}" .labels="${this.keys}"></multi-legend>
      </multi-chart-bar>

    `;
  }

  static get properties() {
    return {
      data: { type: Array },
      states: { type: Array },
      keys: { type: Array },
      padding: { type: Number },
      rightMargin: { type: Number },
      format: { type: Function },
      stacked: { type: Boolean },
      keyAccessor: { type: Function },
      value: { type: Function },
      scaleInterval: {type: Object},
      timeFormat: { type: String },
      colorScale: { type: Function }

    };
  }

  constructor() {
    super()
    this.colorScale = scales.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    this.rightMargin = 150;
    const data = timeData(30);
    // Note(cg): we remove some values.
    delete data[2];
    delete data[3];
    delete data[4];
    delete data[5];
    this.data = data;
    this.keys = ['count']

    this.scaleInterval = time.timeDay
    this.value = (d, key) => {return  d && d.value.count || 0}
    this.timeFormat = '%d %b'
    this.keyAccessor = d => d && d.key;
    this.padding = 0.1
  }
}

customElements.define('demo-bar-time', Chart);
