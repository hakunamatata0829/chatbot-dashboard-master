import React from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';
import { Button, Input, Form, message, Spin } from 'antd';
import { addCard } from 'services/firebase';

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

const submitFormLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 10, offset: 7 },
  },
};

class _StripeCard extends React.PureComponent {
  state = {
    name: '',
    email: '',
    line1: '',
    city: '',
    country: '',
    loading: false,
  };

  submit = async () => {
    // const owner = {
    //   name: this.state.name,
    //   email: this.state.email,
    //   address: {
    //     line1: this.state.line1,
    //     city: this.state.city,
    //     country: this.state.country,
    //   },
    // };
    // try {
    //   this.setState({ loading: true });
    //   const { source, error } = await this.props.stripe.createSource({ type: 'card', owner });
    //   if (error) {
    //     throw new Error(error.message);
    //   }
    //   // await addCard({ source: source.id });
    //   this.props.stripe.customers.createSource(stripe_id, {
    //     source,
    //   }, (err, source) => {
    //       if (err) { reject(err); }
    //       resolve(source);
    //   });
    //   message.success('Card was successfully added');
    //   if ('onSubmitSuccess' in this.props) {
    //     this.props.onSubmitSuccess();
    //   }
    // } catch (e) {
    //   message.error(e);
    // }
    // this.setState({ loading: false });
  };

  onChange = async e => {
    this.setState({ [e.currentTarget.name]: e.currentTarget.value });
  };

  render() {
    return (
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
          <FormItem {...formItemLayout} label="Payment">
            <div style={{ paddingTop: 10 }}>
              <CardElement />
            </div>
          </FormItem>
          <FormItem {...submitFormLayout}>
            <Button onClick={this.submit}>Submit</Button>
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

const StripeCard = injectStripe(_StripeCard);

export { StripeCard };
