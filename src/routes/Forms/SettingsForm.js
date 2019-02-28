import React, { PureComponent } from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { SettingsForm } from '../../components/SettingsForm';
import { Button, Card, Icon, Drawer, Input } from 'antd';
import styles from './style.less';
import { connect } from 'dva';
import { notification } from 'antd';
const openNotificationWithIcon = type => {
  notification[type]({
    message: 'Text Copied',
    duration: 2,
  });
};
const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
class SettingsPage extends PureComponent {
  state = { visible: false };

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };
  iconClick = () => {
    copyToClipboard(this.props.scriptValue);
    openNotificationWithIcon('success');
  };

  render() {
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div>
            <Button type="primary" onClick={this.showDrawer}>
              Plugin Configuration
            </Button>
            <Drawer
              title="Steps to enable chat bot on your web portal"
              placement="bottom"
              onClose={this.onClose}
              visible={this.state.visible}
              style={{ textAlign: 'center' }}
              closable={true}
            >
              <h3>Copy and paste the following script in your html file.</h3>
              <p>Happy chatting :)</p>
              <Input
                addonAfter={<Icon type="copy" onClick={this.iconClick} />}
                style={{ width: '50%', textAlign: 'center' }}
                disabled={true}
                defaultValue={this.props.scriptValue}
              />
            </Drawer>
          </div>
          <SettingsForm />
        </Card>
      </PageHeaderLayout>
    );
  }
}

export default connect(({ user, languages }) => ({
  currentUser: user.currentUser,
  scriptValue: `<script async src='https://chatbot-overpass.firebaseapp.com/injector.js' data-uid='${
    user.currentUser.uid
  }'></script>`,
  languages,
}))(SettingsPage);
