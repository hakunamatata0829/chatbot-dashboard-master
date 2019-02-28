import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Switch,
  InputNumber,
  Collapse,
  Modal,
  AutoComplete,
  Tooltip,
  Tag,
  Icon,
  message,
} from 'antd';
import { db } from 'services/firebase';
import { placesAutocomplete } from 'services/firebase';
import _ from 'lodash';

const FormItem = Form.Item;
const { Option } = Select;

const Panel = Collapse.Panel;
const emailRe = new RegExp(
  String.raw`^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$`
);
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

class LocationFormModal extends PureComponent {
  state = {
    location: this.props.location,
    suggestions: [],
    inputVisible: false,
    inputValue: '',
    documentSendingEmailIDs: [],
    emailValidation: true,
    webhookEnabled: false,
    redirectEnabled: false,
    webhookUrl: '',
    redirectUrl: '',
  };

  componentWillReceiveProps(props) {
    if (props.location !== this.props.location) {
      if (this.props.roles.length <= 0 && props.roles.length > 0) {
        this.setState({ location: props.location }, () => {
          this.updateBlankOpenings(props);
        });
      } else {
        let stateProperty = { ...props.location };
        stateProperty.executiveEmails = stateProperty.executiveEmails
          ? stateProperty.executiveEmails
          : [];
        this.setState({ location: { ...stateProperty } });
      }
    } else if (this.props.roles.length <= 0 && props.roles.length > 0) {
      this.updateBlankOpenings(props);
    }
  }

  updateBlankOpenings = props => {
    const roleId = props.roles[0].uid;
    const openings = this.state.location.openings.map(opening => {
      return { ...opening, roleId };
    });
    const location = { ...this.state.location, openings };
    this.setState({ location });
  };

  addOpening = () => {
    const newOpening = { quantity: 1, roleId: this.props.roles[0].uid };
    const location = {
      ...this.state.location,
      openings: [...this.state.location.openings, newOpening],
    };
    this.setState({ location });
  };

  removeOpening = index => () => {
    const openings = [
      ...this.state.location.openings.slice(0, index),
      ...this.state.location.openings.slice(index + 1, this.state.location.openings.length),
    ];
    const location = { ...this.state.location, openings };
    this.setState({ location });
  };

  onSelectChange = index => value => {
    const opening = { ...this.state.location.openings[index], roleId: value };
    const location = {
      ...this.state.location,
      openings: [
        ...this.state.location.openings.slice(0, index),
        opening,
        ...this.state.location.openings.slice(index + 1, this.state.location.openings.length),
      ],
    };
    this.setState({ location });
  };

  onQuantityChange = index => quantity => {
    const opening = { ...this.state.location.openings[index], quantity };
    const location = {
      ...this.state.location,
      openings: [
        ...this.state.location.openings.slice(0, index),
        opening,
        ...this.state.location.openings.slice(index + 1, this.state.location.openings.length),
      ],
    };
    this.setState({ location });
  };

  get openingOptions() {
    return this.props.roles.map(role => {
      return (
        <Option key={role.uid} value={role.uid}>
          {role.name}
        </Option>
      );
    });
  }

  handleClose = removedTag => {
    const removedData = this.state.location.executiveEmails.filter(tag => tag !== removedTag);
    var stateProperty = { ...this.state.location };
    stateProperty.executiveEmails = removedData;
    this.setState({ location: { ...stateProperty } });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const state = this.state;
    const inputValue = state.inputValue;
    let tags = state.location.executiveEmails;
    const stateProperty = { ...this.state.location };
    if (emailRe.test(inputValue)) {
      if (inputValue && tags !== undefined && tags.indexOf(inputValue) === -1) {
        stateProperty.executiveEmails = [...tags, inputValue];
      } else {
        stateProperty.executiveEmails = [inputValue];
      }

      this.setState({
        location: { ...stateProperty },
        inputVisible: false,
        inputValue: '',
        emailValidation: true,
      });
    } else {
      this.setState({
        location: { ...stateProperty },
        inputVisible: true,
        inputValue: inputValue,
        emailValidation: false,
      });
    }
  };

  saveInputRef = input => (this.input = input);
  renderOpeningField = (opening, index) => {
    return (
      <FormItem {...formItemLayout} label={`Opening ${index + 1}`} key={index}>
        <Select
          showSearch
          placeholder="Role"
          value={opening.roleId}
          style={{ width: 100, marginRight: 10 }}
          onChange={this.onSelectChange(index)}
        >
          {this.openingOptions}
        </Select>
        <InputNumber
          style={{ marginRight: 10 }}
          min={1}
          max={100}
          value={opening.quantity}
          onChange={this.onQuantityChange(index)}
        />
        <Button
          shape="circle"
          icon="close"
          onClick={(index !== 0 && this.removeOpening(index)) || undefined}
        />
      </FormItem>
    );
  };

  afterclose = e => {
    this.setState(this.state);
  };

  onChange = async e => {
    const location = { ...this.state.location, [e.currentTarget.name]: e.currentTarget.value };
    this.setState({ location });
  };

  onRedirectUrlChange = e => {
    const location = {
      ...this.state.location,
      redirecturl: e.target.value,
    };
    this.setState({ location });
  };

  onWebhookUrlChange = e => {
    const location = {
      ...this.state.location,
      webhookurl: e.target.value,
    };
    this.setState({ location });
  };
  autocompleteOnChange = async value => {
    const location = { ...this.state.location, address: value };
    this.setState({ location });
    this.getAutocompleteResults(value);
  };

  onSelect = value => {
    const location = { ...this.state.location, address: value };
    this.setState({ location });
  };

  onWebhooksChange = checked => {
    const location = { ...this.state.location, enableWebhooks: checked };
    this.setState({ location });
  };

  onRedirectChange = checked => {
    const location = { ...this.state.location, enableRedirect: checked };
    this.setState({ location });
  };

  getAutocompleteResults = _.debounce(async input => {
    if (input.length >= 4) {
      const { data } = await placesAutocomplete(input);
      this.setState({ suggestions: data });
    }
  }, 350);

  onOk = async () => {
    this.setState({ loading: true });
    await this.props.onOk(this.state.location);
    this.setState({ loading: false });
  };

  get valid() {
    if (this.state.location.name.length <= 0) {
      return false;
    }
    if (this.state.location.address.length <= 0) {
      return false;
    }
    if (this.state.location.executiveEmails.length <= 0) {
      return false;
    }
    if (this.state.location.openings.length <= 0) {
      return false;
    }
    const valid = this.state.location.openings.every(opening => {
      return opening.quantity > 0 && opening.roleId !== '';
    });
    if (!valid) {
      return false;
    }
    return true;
  }

  render() {
    return (
      <Modal
        width={1600}
        title={this.props.title}
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.props.onCancel}
        okButtonProps={{
          disabled: !this.valid,
          loading: this.state.loading,
        }}
      >
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <FormItem {...formItemLayout} label="Name">
            <Input
              placeholder="Saint-Charles / Hymus"
              value={this.state.location.name}
              name="name"
              onChange={this.onChange}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Address">
            <AutoComplete
              dataSource={this.state.suggestions}
              placeholder="1264 Boulevard Saint-Charles, Kirkland, QC"
              value={this.state.location.address}
              name="address"
              onChange={this.autocompleteOnChange}
              onSelect={this.onSelect}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            validateStatus={this.state.emailValidation ? '' : 'error'}
            help={this.state.emailValidation ? '' : "Email should be in this format 'abc@abc.com'"}
            label="Send Applicant Info to Email IDs"
          >
            {this.state.location.executiveEmails !== undefined ? (
              this.state.location.executiveEmails.map((tag, index) => {
                const isLongTag = tag ? tag.length > 20 : false;
                const tagElem = (
                  <Tag
                    key={index}
                    closable={index !== -1}
                    afterClose={() => this.handleClose(tag)}
                    onClose={e => this.afterclose(e)}
                  >
                    {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                  </Tag>
                );
                return isLongTag ? (
                  <Tooltip title={tag} key={tag}>
                    {tagElem}
                  </Tooltip>
                ) : (
                  tagElem
                );
              })
            ) : (
              <div>Null</div>
            )}
            {this.state.inputVisible && (
              <Input
                ref={this.saveInputRef}
                type="text"
                size="small"
                style={{ width: 78 }}
                value={this.state.inputValue}
                onChange={this.handleInputChange}
                onBlur={this.handleInputConfirm}
                onPressEnter={this.handleInputConfirm}
              />
              // </Form.Item>
            )}
            {!this.state.inputVisible && (
              <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
                <Icon type="plus" /> New Email Address
              </Tag>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Openings">
            <Collapse bordered={false} defaultActiveKey={[]}>
              <Panel header="Details" key="1">
                <div style={{ position: 'absolute', zIndex: 1000 }}>
                  <Button shape="circle" icon="plus" size="large" onClick={this.addOpening} />
                </div>
                {this.state.location.openings.map(this.renderOpeningField)}
              </Panel>
            </Collapse>
          </FormItem>
          <FormItem {...formItemLayout} label="Enable Webhooks">
            <Switch
              checkedChildren="Enable"
              unCheckedChildren="Disable"
              onChange={this.onWebhooksChange}
              name="enableWebhooks"
              checked={this.state.location.enableWebhooks}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Webhook URL">
            <Input
              placeholder="https://....."
              value={this.state.location.webhookurl ? this.state.location.webhookurl : ''}
              name="webhookurl"
              onChange={this.onWebhookUrlChange}
              disabled={!this.state.location.enableWebhooks}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Enable Success Redirects">
            <Switch
              checkedChildren="Enable"
              unCheckedChildren="Disable"
              onChange={this.onRedirectChange}
              name="enableRedirect"
              checked={this.state.location.enableRedirect}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Redirect URL">
            <Input
              placeholder="https://...."
              value={this.state.location.redirecturl ? this.state.location.redirecturl : ''}
              name="redirecturl"
              onChange={this.onRedirectUrlChange}
              disabled={!this.state.location.enableRedirect}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default LocationFormModal;
