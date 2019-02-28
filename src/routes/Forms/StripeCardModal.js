import React, { PureComponent } from 'react';
import { Form, Input, Modal, Spin } from 'antd';

import { CardElement } from 'react-stripe-elements';

const FormItem = Form.Item;

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

class StripeCardModal extends PureComponent {
  state = this.props.ownerInfo || {};

  componentWillReceiveProps(props) {
    if (props.ownerInfo !== this.props.ownerInfo) {
      this.setState({ ...props.ownerInfo });
    }
  }

  onOk = async () => {
    this.setState({ loading: true });
    await this.props.onOk(this.state);
    this.setState({ loading: false });
  };

  get cardField() {
    if (this.props.showCard) {
      return (
        <FormItem {...formItemLayout} label="Payment">
          <div style={{ paddingTop: 10 }}>
            <CardElement />
          </div>
        </FormItem>
      );
    }
    return null;
  }

  onChange = async e => {
    this.setState({ [e.currentTarget.name]: e.currentTarget.value });
  };

  render() {
    return (
      <Modal
        width={900}
        title={this.props.title}
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.props.onCancel}
      >
        <Spin spinning={this.state.loading}>
          <Form hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="Name">
              <Input
                placeholder="Jane Doe"
                value={this.state.name}
                name="name"
                onChange={this.onChange}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="Email">
              <Input
                placeholder="janedoe@gmail.com"
                value={this.state.email}
                name="email"
                onChange={this.onChange}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="Address">
              <Input
                placeholder="123 Apple Avenue"
                value={this.state.line1}
                name="line1"
                onChange={this.onChange}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="City">
              <Input
                placeholder="Montreal"
                value={this.state.city}
                name="city"
                onChange={this.onChange}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="Country">
              <Input
                placeholder="Canada"
                value={this.state.country}
                name="country"
                onChange={this.onChange}
              />
            </FormItem>
            {this.cardField}
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default StripeCardModal;
