import React, { Component } from 'react';
import { Card, Button, Icon, List } from 'antd';
import styles from './index.less';

export default class PriceCard extends Component {
  get attributes() {
    return this.props.attributes.map((attribute, key) => {
      return (
        <li key={key} style={{ fontWeight: key > 2 ? 'bold' : '', padding: 0 }}>
          {attribute}
        </li>
      );
    });
  }

  onClick = () => {
    this.props.onClick(this.props.uid);
  };

  get containerClassName() {
    if (!this.props.selected) {
      return `${styles.price} ${styles.container}`;
    } else {
      return `${styles.price} ${styles.container} ${styles.containerSelected}`;
    }
  }

  render() {
    return (
      <ul className={this.containerClassName + ' ulFLex'}>
        <li style={{ fontWeight: 900, fontSize: '30px', color: 'black', paddingBottom: 0 }}>
          {this.props.name}
        </li>
        <li style={{ padding: 0 }}>
          <p style={{ color: 'dodgerblue' }}>{this.props.description}</p>
        </li>
        <li
          style={{ color: 'rgb(126, 112, 243)', fontSize: '28px', fontWeight: '900', padding: 0 }}
        >
          {typeof this.props.price === 'number'
            ? `$${this.props.price}/mo`
            : this.props.price.toUpperCase()}
        </li>
        {this.attributes}
        <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {this.props.selected ? (
            <Button type="primary" className="selectedPlan" onClick={this.onClick}>
              Your Current Plan
            </Button>
          ) : (
            <Button type="primary" style={{ borderRadius: '20px' }} onClick={this.onClick}>
              {this.props.buttonLabel}
            </Button>
          )}
        </li>
      </ul>
    );
  }
}
