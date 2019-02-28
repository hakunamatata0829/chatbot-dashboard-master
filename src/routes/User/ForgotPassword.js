import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form, Button, Input, Checkbox, Alert, Icon } from 'antd';
import styles from './Login.less';
import store from '../../index';
import { message } from 'antd';
import { sendResetPassword } from 'services/firebase';
const FormItem = Form.Item;
const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
export default class ForgotPassword extends Component {
  state = {
    email: '',
    showSubmit: false,
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  pressedEnter = e => {
    if (emailRegex.test(e.target.value)) {
      this.setState({
        email: e.target.value,
        showSubmit: true,
      });
    } else {
      this.setState({
        showSubmit: false,
      });
    }
  };

  changeHandler = e => {
    if (emailRegex.test(e.target.value)) {
      this.setState({
        email: e.target.value,
        showSubmit: true,
      });
    } else {
      this.setState({
        showSubmit: false,
      });
    }
  };

  handleSubmit = async () => {
    const returnedValue = await sendResetPassword({ email: this.state.email });
    if (returnedValue.success) {
      store.dispatch({
        type: 'user/login',
      });
    }
  };

  render() {
    return (
      <div className={styles.main} style={{ marginTop: '2%', textAlign: 'center' }}>
        <h3>Forgot Password</h3>
        <Form>
          <FormItem>
            <Input
              size="large"
              type="email"
              placeholder="Email ID Linked with Ovrpass Account"
              onPressEnter={this.pressedEnter}
              onChange={this.changeHandler}
            />
          </FormItem>
          <FormItem>
            <Button
              size="large"
              className={styles.submit}
              type="primary"
              htmlType="button"
              disabled={!this.state.showSubmit}
              onClick={this.handleSubmit}
            >
              Forgot Password
            </Button>
            <Link className={styles.login} style={{ padding: '5px' }} to="/user/login">
              Sign in with existing account
            </Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}
