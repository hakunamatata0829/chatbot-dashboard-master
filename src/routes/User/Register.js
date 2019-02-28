import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Form, Input, Button, message, Popover, Progress } from 'antd';
import styles from './Register.less';
import { register as firebaseRegister } from 'services/firebase';
import ReactPhoneInput from 'react-phone-input-2';
import { formatPhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
const FormItem = Form.Item;
const phoneRegex = /^\+(?:[0-9] ?){6,16}[0-9]$/;
const passwordStatusMap = {
  ok: <div className={styles.success}>Strength：Ok</div>,
  pass: <div className={styles.warning}>Strength：Pass</div>,
  poor: <div className={styles.error}>Strength：Poor</div>,
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

@connect(({ register, loading }) => ({
  register,
  submitting: loading.effects['register/submit'],
}))
@Form.create()
export default class Register extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86',
    phone: '',
  };

  componentWillReceiveProps(nextProps) {
    const { form, dispatch } = this.props;
    const account = form.getFieldValue('email');
    if (nextProps.register.status === 'ok') {
      dispatch(
        routerRedux.push({
          pathname: '/user/register-result',
          state: {
            account,
          },
        })
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleOnChange = value => {
    this.setState({
      phone: value,
    });
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields({ force: true }, async (err, values) => {
      if (!err) {
        try {
          await firebaseRegister(values);
        } catch (e) {
          message.error(e.message);
        }
      } else {
        message.error('Check for the required field and formats');
      }
    });
  };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('Confirm?!');
    } else {
      callback();
    }
  };

  checkConfirmPhone = (rule, value, callback) => {
    const { form } = this.props;
    if (value && isValidPhoneNumber(formatPhoneNumber(value, 'International'))) {
      callback();
    } else {
      callback('Not A Valid Phone Number');
    }
  };
  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        help: 'Invalid！',
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      const { visible, confirmDirty } = this.state;
      if (!visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { help, visible } = this.state;
    return (
      <div className={styles.main}>
        <h3 style={{ textAlign: 'center', fontWeight: 'bold', color: '#6792f0', fontSize: '28px' }}>
          Try Free For 14 Days
        </h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            {getFieldDecorator('email', {
              rules: [
                {
                  required: true,
                  message: 'This field is required',
                },
                {
                  type: 'email',
                  message: 'This is not a valid e-mail',
                },
              ],
            })(<Input size="large" placeholder="Email" />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('phone', {
              rules: [
                {
                  required: true,
                  message: 'This field is required！',
                },
                {
                  validator: this.checkConfirmPhone,
                },
              ],
            })(<ReactPhoneInput defaultCountry={'us'} />)}
          </FormItem>
          <FormItem help={help}>
            <Popover
              content={
                <div style={{ padding: '4px 0' }}>
                  {passwordStatusMap[this.getPasswordStatus()]}
                  {this.renderPasswordProgress()}
                  <div style={{ marginTop: 10 }}>
                    Please enter at least 6 characters. Please do not use passwords that are easy to
                    guess.
                  </div>
                </div>
              }
              overlayStyle={{ width: 240 }}
              placement="right"
              visible={visible}
            >
              {getFieldDecorator('password', {
                rules: [
                  {
                    validator: this.checkPassword,
                  },
                ],
              })(<Input size="large" type="password" placeholder="Password" />)}
            </Popover>
          </FormItem>
          <FormItem>
            {getFieldDecorator('confirm', {
              rules: [
                {
                  required: true,
                  message: 'This field is required！',
                },
                {
                  validator: this.checkConfirm,
                },
              ],
            })(<Input size="large" type="password" placeholder="Confirm Password" />)}
          </FormItem>
          <FormItem>
            <Button
              size="large"
              loading={submitting}
              className={styles.submit}
              type="primary"
              htmlType="submit"
            >
              Register
            </Button>
            <Link className={styles.login} to="/user/login">
              Sign in with existing account
            </Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}
