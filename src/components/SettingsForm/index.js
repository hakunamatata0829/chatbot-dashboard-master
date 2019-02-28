import React, { PureComponent } from 'react';
import {
  Dropdown,
  Col,
  Tooltip,
  Tag,
  Checkbox,
  Alert,
  Icon,
  Form,
  Input,
  message,
  Button,
  Select,
} from 'antd';
import { db } from 'services/firebase';
const { TextArea } = Input;
const InputGroup = Input.Group;
const { Option } = Select;
const FormItem = Form.Item;
import { connect } from 'dva';
import { styles } from './index.less';
class _SettingsForm extends PureComponent {
  state = {
    companyName: this.props.currentUser.companyName,
    declineMessage: this.props.currentUser.declineMessage,
    successMessage: this.props.currentUser.successMessage,
    welcomeMessage: this.props.currentUser.welcomeMessage,
    locationQuestion: this.props.currentUser.locationQuestion
      ? this.props.currentUser.locationQuestion
      : '',
    themeColor: this.props.currentUser.themeColor ? this.props.currentUser.themeColor : '#40a9ff',
    language: this.props.currentUser.language,
  };

  selectBefore(color) {
    return <Button style={{ background: `${color}` }} />;
  }

  componentWillReceiveProps(props) {
    if (props.currentUser) {
      const {
        companyName,
        declineMessage,
        successMessage,
        welcomeMessage,
        language,
        locationQuestion,
        themeColor,
      } = props.currentUser;
      this.setState({
        companyName,
        declineMessage,
        successMessage,
        welcomeMessage,
        language,
        locationQuestion,
        themeColor,
      });
    }
  }

  onChange = e => {
    this.setState({ [e.currentTarget.name]: e.currentTarget.value });
  };

  onSubmit = async e => {
    try {
      await db
        .collection('users')
        .doc(this.props.currentUser.uid)
        .update({
          companyName: this.state.companyName,
          declineMessage: this.state.declineMessage,
          successMessage: this.state.successMessage,
          welcomeMessage: this.state.welcomeMessage,
          locationQuestion: this.state.locationQuestion,
          themeColor: this.state.themeColor,
          language: this.state.language,
        });
      message.success('Profile was successfully updated!');
    } catch (e) {
      message.error(e.message);
    }
  };

  onCancel = () => {
    const {
      companyName,
      declineMessage,
      successMessage,
      welcomeMessage,
      locationQuestion,
      themeColor,
    } = this.props.currentUser;
    // const locationQuestion = this.props.currentUser.locationQuestion ? this.props.currentUser.locationQuestion : '';
    // const themeColor = this.props.currentUser.themeColor ? this.props.currentUser.themeColor : '#D9F7G4';
    this.setState({
      companyName,
      declineMessage,
      successMessage,
      welcomeMessage,
      locationQuestion,
      themeColor,
    });
  };

  get languageOptions() {
    return this.props.languages.map(language => {
      return (
        <Option key={language.uid} value={language.uid}>
          {language.label}
        </Option>
      );
    });
  }

  onSelectChange = value => {
    this.setState({ language: value });
  };

  get canSubmit() {
    return this.state.companyName && this.state.companyName.length > 0;
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    return (
      <Form hideRequiredMark style={{ marginTop: 8 }}>
        <FormItem {...formItemLayout} label="Company Name">
          <Input
            placeholder="Company Name"
            value={this.state.companyName}
            onChange={this.onChange}
            name="companyName"
          />
        </FormItem>
        <FormItem {...formItemLayout} label="Welcome Message">
          <TextArea
            placeholder="Welcome Message"
            value={this.state.welcomeMessage}
            onChange={this.onChange}
            name="welcomeMessage"
            autosize={{ minRows: 4, maxRows: 4 }}
          />
        </FormItem>
        <FormItem {...formItemLayout} label="Location Question">
          <TextArea
            placeholder="Location Question"
            value={this.state.locationQuestion}
            onChange={this.onChange}
            name="locationQuestion"
            autosize={{ minRows: 4, maxRows: 4 }}
          />
        </FormItem>
        <FormItem {...formItemLayout} label="Success Message">
          <TextArea
            placeholder="Success Message"
            value={this.state.successMessage}
            onChange={this.onChange}
            name="successMessage"
            autosize={{ minRows: 4, maxRows: 4 }}
          />
        </FormItem>
        <FormItem {...formItemLayout} label="Decline Message">
          <TextArea
            placeholder="Decline Message"
            value={this.state.declineMessage}
            onChange={this.onChange}
            name="declineMessage"
            autosize={{ minRows: 4, maxRows: 4 }}
          />
        </FormItem>
        <FormItem {...formItemLayout} label="Language">
          <Select
            showSearch
            placeholder="Language"
            value={this.state.language}
            style={{ width: 100, marginRight: 10 }}
            onChange={this.onSelectChange}
          >
            {this.languageOptions}
          </Select>
        </FormItem>
        <FormItem {...formItemLayout} label="Theme Color">
          <InputGroup compact>
            <Col span={5} style={{ height: '32px', width: '32px', paddingRight: 0 }}>
              <div
                style={{
                  backgroundColor: this.state.themeColor ? this.state.themeColor : 'black',
                  width: '100%',
                  height: '100%',
                }}
                className={'colorpalette'}
              />
            </Col>
            <Col span={10}>
              <Input
                placeholder="Theme"
                value={this.state.themeColor}
                onChange={this.onChange}
                name="themeColor"
                className={'colorpaletteinput'}
              />
            </Col>
          </InputGroup>
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!this.canSubmit}
            onClick={this.onSubmit}
          >
            Submit
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.onCancel}>
            Cancel
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const SettingsForm = connect(({ user, languages }) => ({
  currentUser: user.currentUser,
  languages,
}))(_SettingsForm);

export { SettingsForm };
