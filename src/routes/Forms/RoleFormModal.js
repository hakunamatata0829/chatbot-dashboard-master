import React, { PureComponent } from 'react';
import { Divider, Form, Input, Modal, Checkbox } from 'antd';
import { db } from 'services/firebase';

import { placesAutocomplete } from 'services/firebase';

const FormItem = Form.Item;
const { TextArea } = Input;

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

class RoleFormModal extends PureComponent {
  state = this.props.role || {};

  componentWillReceiveProps(props) {
    if (props.role !== this.props.role) {
      this.setState({ ...props.role });
    }
    console.log('willRecieveProps', props.role);
  }

  componentWillUpdate(props) {
    if (props.role !== this.props.role) {
      this.setState({ ...props.role });
    }
    console.log('willupdate', props.role);
  }
  textOnChange = e => {
    this.setState({ [e.currentTarget.name]: e.currentTarget.value });
  };

  checkboxOnChange = e => {
    this.setState({ [e.target.name]: e.target.checked });
  };

  onOk = async () => {
    this.setState({ loading: true });
    await this.props.onOk(this.state);
    this.setState({ loading: false });
  };

  get valid() {
    if (this.state.name.length <= 0) {
      return false;
    }
    if (this.state.description.length <= 0) {
      return false;
    }
    if (this.state.traits.length <= 0) {
      return false;
    }
    return true;
  }

  render() {
    return (
      <Modal
        width={900}
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
              name="name"
              onChange={this.textOnChange}
              placeholder="Name"
              value={this.state.name}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Description">
            <TextArea
              name="description"
              onChange={this.textOnChange}
              autosize={{ minRows: 8, maxRows: 8 }}
              placeholder="Description"
              value={this.state.description}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Yes Reply">
            <TextArea
              name="descriptionYesReply"
              onChange={this.textOnChange}
              autosize={{ minRows: 1, maxRows: 1 }}
              placeholder="Description of traits Yes Reply"
              value={this.state.descriptionYesReply}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="No Reply">
            <TextArea
              name="descriptionNoReply"
              onChange={this.textOnChange}
              autosize={{ minRows: 1, maxRows: 1 }}
              placeholder="Description of traits No Reply"
              value={this.state.descriptionNoReply}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Enable Description Reply">
            <Checkbox
              value={this.state.activateDescriptionReply}
              onChange={this.checkboxOnChange}
              name="activateDescriptionReply"
            />
          </FormItem>
          <Divider />
          <FormItem {...formItemLayout} label="Desired Traits">
            <TextArea
              name="traits"
              onChange={this.textOnChange}
              autosize={{ minRows: 8, maxRows: 8 }}
              placeholder="Desired Traits"
              value={this.state.traits}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Yes Reply">
            <TextArea
              name="desiredYesReply"
              onChange={this.textOnChange}
              autosize={{ minRows: 1, maxRows: 1 }}
              placeholder="Desired Traits Yes Reply"
              value={this.state.desiredYesReply}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="No Reply">
            <TextArea
              name="desiredNoReply"
              onChange={this.textOnChange}
              autosize={{ minRows: 1, maxRows: 1 }}
              placeholder="Desired Traits No Reply"
              value={this.state.desiredNoReply}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Enable Desired Traits Reply">
            <Checkbox
              value={this.state.activateTraitsReply}
              onChange={this.checkboxOnChange}
              name="activateTraitsReply"
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Attributes">
            <Checkbox
              checked={this.state.requirePastExperience ? 'checked' : ''}
              value={this.state.requirePastExperience}
              onChange={this.checkboxOnChange}
              name="requirePastExperience"
            >
              Past Experiences
            </Checkbox>
            <Checkbox
              checked={this.state.requireCar ? 'checked' : ''}
              value={this.state.requireCar}
              onChange={this.checkboxOnChange}
              name="requireCar"
            >
              Car
            </Checkbox>{' '}
            <br />
            <Checkbox
              checked={this.state.languageEn ? 'checked' : ''}
              value={this.state.languageEn}
              onChange={this.checkboxOnChange}
              name="languageEn"
            >
              Language (English)
            </Checkbox>
            <Checkbox
              checked={this.state.languageFr ? 'checked' : ''}
              value={this.state.languageFr}
              onChange={this.checkboxOnChange}
              name="languageFr"
            >
              Language (French)
            </Checkbox>
            <br />
            <Checkbox
              checked={this.state.languageFluent ? 'checked' : ''}
              value={this.state.languageFluent}
              onChange={this.checkboxOnChange}
              name="languageFluent"
            >
              Language (Fluent)
            </Checkbox>
            <Checkbox
              checked={this.state.languageBilingual ? 'checked' : ''}
              value={this.state.languageBilingual}
              onChange={this.checkboxOnChange}
              name="languageBilingual"
            >
              Language (Bilingual)
            </Checkbox>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default RoleFormModal;
