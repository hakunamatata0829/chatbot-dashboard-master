import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox, Alert, Icon } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import { login as firebaseLogin } from 'services/firebase';
import { message } from 'antd';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  };

  onTabChange = type => {
    this.setState({ type });
  };

  handleSubmit = async (err, values) => {
    if (!err) {
      try {
        await firebaseLogin(values);
      } catch (e) {
        message.error(e.message);
      }
    }
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  render() {
    const { login, submitting } = this.props;
    const { type, autoLogin } = this.state;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          {login.status === 'error' &&
            login.type === 'account' &&
            !submitting &&
            this.renderMessage('账户或密码错误（admin/888888）')}
          <UserName name="email" placeholder="admin@admin.admin" />
          <Password name="password" placeholder="888888/123456" />
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              Remember me
            </Checkbox>
            <Link className={styles.register} to="/user/forgotPassword">
              Forgot password?
            </Link>
          </div>
          <Submit loading={submitting}>Submit</Submit>
          <div className={styles.other}>
            <Link className={styles.register} to="/user/register">
              Register
            </Link>
          </div>
        </Login>
      </div>
    );
  }
}
