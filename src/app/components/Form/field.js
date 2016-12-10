import React, { Component, PropTypes } from 'react';
import getDisplayName from 'react-display-name';

import { _formShape } from './form';


export const fieldShape = PropTypes.shape({
  setValue: PropTypes.func.isRequired,
  triggerValidation: PropTypes.func.isRequired,
  hideValidation: PropTypes.func.isRequired,
}).isRequired;

export default function field() {
  return WrappedComponent => class Field extends Component {
    static contextTypes = {
      form: _formShape,
    };

    static displayName = `Field(${getDisplayName(WrappedComponent)})`;

    static propTypes = {
      name: PropTypes.string.isRequired,
    };

    state = {
      valid: true,
    };

    getValue = () => {
      return this._field.getValue();
    };

    setValue = (value) => {
      this.context.form.updateField(this.props.name, { value });
    };

    triggerValidation = () => {
      const valid = this._field.checkValidity();
      this.context.form.updateField(this.props.name, { valid });
      this.setState({ valid });
    };

    hideValidation = () => {
      this.context.form.updateField(this.props.name, { valid: true });
      this.setState({ valid: true });
    };

    componentDidMount() {
      this.context.form.updateField(this.props.name, {
        component: this,
        value: this.getValue(),
        valid: true,
      });
    }

    componentWillUnmount() {
      this.context.form.removeField(this.props.name);
    }

    render() {
      const { valid } = this.state;
      return (
        <WrappedComponent
          ref={ref => (this._field = ref)}
          {...this.props}
          field={{
            setValue: this.setValue,
            triggerValidation: this.triggerValidation,
            hideValidation: this.hideValidation,
            valid,
            invalid: !valid,
          }} />
      );
    }
  };
}
