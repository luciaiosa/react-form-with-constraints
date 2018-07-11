import React from 'react';
import { Text, TextProps, StyleProp } from 'react-native';
import { TextInput } from './TextInput'; // Specific to TypeScript

import {
  FormWithConstraints as _FormWithConstraints, FormWithConstraintsContext,
  FieldFeedbacks, FieldFeedbacksContext,
  Async, AsyncContext,
  FieldFeedback as _FieldFeedback, FieldFeedbackBaseProps as _FieldFeedbackBaseProps, FieldFeedbackType, FieldFeedbackPrivate as _FieldFeedbackPrivate,
  FieldFeedbackWhenValid as _FieldFeedbackWhenValid, FieldFeedbackWhenValidBaseProps as _FieldFeedbackWhenValidBaseProps,
  deepForEach
} from 'react-form-with-constraints';

class FormWithConstraints extends _FormWithConstraints {
  // @ts-ignore
  // Property 'validateFields' in type 'FormWithConstraints' is not assignable to the same property in base type 'FormWithConstraints'.
  validateFields(...inputsOrNames: Array<TextInput | string>);

  // @ts-ignore
  // Property 'normalizeInputs' in type 'FormWithConstraints' is not assignable to the same property in base type 'FormWithConstraints'.
  //
  // If called without arguments, returns all fields
  // Returns the inputs in the same order they were given
  protected normalizeInputs(...inputsOrNames: Array<TextInput | string>) {
    const inputs: TextInput[] = [];

    if (inputsOrNames.length === 0) {
      // Find all children with a name
      deepForEach(this.props.children, child => {
        if (child.props !== undefined) {
          const fieldName = child.props.name;
          if (fieldName !== undefined && fieldName.length > 0) {
            inputs.push(child as any);
          }
        }
      });
    } else {
      inputsOrNames.forEach(input => {
        if (typeof input === 'string') {
          deepForEach(this.props.children, child => {
            if (child.props !== undefined) {
              const fieldName = child.props.name;
              if (input === fieldName) {
                inputs.push(child as any);
              }
            }
          });
        } else {
          inputs.push(input);
        }
      });
    }

    // Checks

    const namesFound = inputs.map(input => input.props.name);
    namesFound.forEach((name, index, self) => {
      if (self.indexOf(name) !== index) {
        throw new Error(`Multiple elements matching '[name="${name}"]' inside the form`);
      }
    });

    const names = inputsOrNames.filter(input => typeof input === 'string') as string[];
    names.forEach(name => {
      if (!namesFound.includes(name)) {
        throw new Error(`Could not find field '[name="${name}"]' inside the form`);
      }
    });

    return inputs;
  }
}

// See Tips for styling your React Native apps https://medium.com/the-react-native-log/tips-for-styling-your-react-native-apps-3f61608655eb
interface FieldFeedbackTheme {
  error?: StyleProp<{color: string}>;
  warning?: StyleProp<{color: string}>;
  info?: StyleProp<{color: string}>;
  whenValid?: StyleProp<{color: string}>;
}

interface FieldFeedbackProps extends _FieldFeedbackBaseProps, TextProps {
  theme?: FieldFeedbackTheme;
}

// See Clone a js object except for one key https://stackoverflow.com/q/34698905
const omitClassesDefaultProps = () => {
  // let's remove classes prop: not relevant with React Native
  // Also remove style to please TypeScript, otherwise:
  // Types of property 'style' are incompatible [...] Type 'CSSProperties' is not assignable to type 'StyleProp<TextStyle>'
  const { classes, style, ...otherProps } = _FieldFeedback.defaultProps!;
  return otherProps;
};

const FieldFeedback: React.SFC<FieldFeedbackProps> = props =>
  <FormWithConstraintsContext.Consumer>
    {form =>
      <FieldFeedbacksContext.Consumer>
        {fieldFeedbacks =>
          <AsyncContext.Consumer>
            {async => <FieldFeedbackPrivate {...props} form={form!} fieldFeedbacks={fieldFeedbacks!} async={async} />}
          </AsyncContext.Consumer>
        }
      </FieldFeedbacksContext.Consumer>
    }
  </FormWithConstraintsContext.Consumer>;

FieldFeedback.defaultProps = omitClassesDefaultProps();

class FieldFeedbackPrivate extends _FieldFeedbackPrivate<FieldFeedbackProps> {
  // Copied and adapted from core/FieldFeedback.render()
  render() {
    const { when, error, warning, info, theme, ...otherProps } = this.props;
    const { validation } = this.state;

    const style = theme !== undefined ? theme[validation.type] : undefined;

    // Special case for when="valid": always displayed, then FieldFeedbackWhenValid decides what to do
    if (validation.type === FieldFeedbackType.WhenValid) {
                                                              // The last style property is the one applied
      return <FieldFeedbackWhenValid data-feedback={this.key} style={style} {...otherProps} />;
    }

    if (validation.show) {
                                            // The last style property is the one applied
      return <Text data-feedback={this.key} style={style} {...otherProps} />;
    }

    return null;
  }
}


type FieldFeedbackWhenValidProps = _FieldFeedbackWhenValidBaseProps & TextProps;

class FieldFeedbackWhenValid extends _FieldFeedbackWhenValid<FieldFeedbackWhenValidProps> {
  // Copied and adapted from core/FieldFeedbackWhenValid.render()
  render() {
    return this.state.fieldIsValid ? <Text {...this.props} /> : null;
  }
}

export {
  FormWithConstraints,
  FieldFeedbacks,
  Async,
  FieldFeedback,
  FieldFeedbackWhenValidProps,
  FieldFeedbackWhenValid
};
