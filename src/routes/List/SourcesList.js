import React, { PureComponent } from 'react';
import { Radio, Checkbox, Table, Card, Divider, Popconfirm, Button, message, Spin } from 'antd';
import { connect } from 'dva';
import StripeCardModal from '../Forms/StripeCardModal';
import { stringify } from 'qs';
import axios from 'axios';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './LocationsList.less';
import { injectStripe } from 'react-stripe-elements';
import {
  addCard,
  deleteCard,
  updateCardInfo,
  getStripeUser,
  changeDefaultSource,
} from 'services/firebase';
import { subscribeToPlan } from '../../services/firebase';
import { routerRedux } from 'dva/router';
const RadioGroup = Radio.Group;
class SourcesList extends PureComponent {
  state = {
    modalState: false,
    loading: false,
  };

  noModalProps = {
    ownerInfo: {
      name: '',
      email: '',
      line1: '',
      city: '',
      country: '',
      loading: false,
    },
    title: '',
    onOk() {},
    visible: false,
  };

  newModalProps = {
    ownerInfo: {
      name: '',
      email: '',
      line1: '',
      city: '',
      country: '',
      loading: false,
    },
    title: 'Add New Payment Source',
    onOk: async card => {
      const owner = {
        name: card.name,
        email: card.email,
        address: {
          line1: card.line1,
          city: card.city,
          country: card.country,
        },
      };

      try {
        const { source, error } = await this.props.stripe.createSource({ type: 'card', owner });
        if (error) {
          throw new Error(error.message);
        }
        await addCard({ source: source.id, entry: this.props.currentUser.stripe_id });
        this.closeModal();
        if (this.props.location && this.props.location.state) {
          if (this.props.location.state.from == 'billings' && this.props.location.state.planType) {
            await subscribeToPlan({ plan: this.props.location.state.planType })
              .then(data => {
                message.success('Plan Subscribed Successfully');
              })
              .catch(error => {
                message.error('Unable to subscribe to the plan');
              });
          }
        }
        message.success(`New payment source has been created.`);
        this.getStripeUser();
      } catch (e) {
        message.error(e.message);
      }
    },
    visible: true,
    showCard: true,
  };

  editModalProps(source) {
    return {
      ownerInfo: {
        name: source.owner.name,
        email: source.owner.email,
        line1: source.owner.address.line1,
        city: source.owner.address.city,
        country: source.owner.address.country,
        loading: false,
        id: source.id,
      },
      title: 'Edit Payment Information',
      onOk: async card => {
        const owner = {
          name: card.name,
          email: card.email,
          address: {
            line1: card.line1,
            city: card.city,
            country: card.country,
          },
        };
        try {
          await updateCardInfo({ sourceId: card.id, owner });
          message.success(`Payment information has been updated.`);
          this.closeModal();
          this.getStripeUser();
        } catch (e) {
          message.error(e.message);
        }
      },
      visible: true,
      showCard: false,
    };
  }

  columns = [
    {
      title: 'Number',
      dataIndex: 'card.last4',
      key: 'number',
      render: text => <a href="javascript:;">**** **** **** {text}</a>,
    },
    {
      title: 'Brand',
      dataIndex: 'card.brand',
      key: 'brand',
    },
    {
      title: 'Expiry Date',
      key: 'expiry',
      render: (text, record) => {
        return (
          <span>
            {record.card.exp_month}/{record.card.exp_year % 100}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'record.id',
      render: (text, record) => (
        <span>
          <a href="javascript:;" onClick={() => this.setState({ modalState: record })}>
            Edit
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure you wish to delete this source?"
            onConfirm={async () => {
              this.setState({ loading: true });
              await deleteCard({ source: record.id });
              await getStripeUser();
              this.setState({ loading: false });
            }}
          >
            <a href="javascript:;">Delete</a>
          </Popconfirm>
        </span>
      ),
    },
    {
      title: 'Set as Default Card for Payments',
      key: 'record.id+1',
      render: (text, record) => <Radio value={record.id}>Make this as default</Radio>,
    },
  ];
  onChange = async e => {
    this.setState({
      loading: true,
    });
    var self = this;
    const data = { default_source: e.target.value, entry: this.props.currentUser.stripe_id };
    await changeDefaultSource(data);
    self.setState({
      loading: false,
    });
    getStripeUser();
  };

  getStripeUser = async () => {
    this.setState({ loading: true });
    await getStripeUser();
    this.setState({ loading: false });
  };

  get modalProps() {
    if (this.state.modalState === false) {
      return this.noModalProps;
    }
    if (this.state.modalState === true) {
      return this.newModalProps;
    }
    return this.editModalProps(this.state.modalState);
  }

  addNewSource = () => {
    this.setState({ modalState: true });
  };

  closeModal = () => {
    this.setState({ modalState: false });
  };
  get data() {
    if (this.props.currentUser && this.props.currentUser.stripeUser) {
      return this.props.currentUser.stripeUser.sources.data;
    }
    return [];
  }
  componentDidMount() {
    if (
      this.props.currentUser &&
      this.props.currentUser.stripeUser &&
      this.props.currentUser.stripeUser.subscriptions &&
      this.props.currentUser.stripeUser.subscriptions.data.length > 0 &&
      this.props.currentUser.stripeUser.subscriptions.data[0].plan.id === 'enterprise'
    ) {
      this.onSubmitSuccess();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.currentUser &&
      nextProps.currentUser.stripeUser &&
      nextProps.currentUser.stripeUser.subscriptions &&
      nextProps.currentUser.stripeUser.subscriptions.data.length > 0 &&
      nextProps.currentUser.stripeUser.subscriptions.data[0].plan.id === 'enterprise'
    ) {
      this.onSubmitSuccess();
    }
  }

  onSubmitSuccess = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/',
      })
    );
  };

  render() {
    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card className={styles.listCard} bordered={false} style={{ marginTop: 24 }}>
            <div className={styles.tableList}>
              <div className={styles.tableListOperator}>
                <Button icon="plus" type="primary" onClick={this.addNewSource}>
                  Add
                </Button>
              </div>
            </div>
            <Spin spinning={this.state.loading}>
              <RadioGroup
                onChange={this.onChange}
                className={styles.tableContainerWithCheckbox}
                value={
                  this.props.currentUser.stripeUser
                    ? this.props.currentUser.stripeUser.default_source
                    : null
                }
              >
                <Table columns={this.columns} dataSource={this.data} rowKey="name" />
              </RadioGroup>
            </Spin>
          </Card>
          <StripeCardModal {...this.modalProps} onCancel={this.closeModal} />
        </div>
      </PageHeaderLayout>
    );
  }
}

export default injectStripe(
  connect(({ user }) => ({
    currentUser: user.currentUser,
  }))(SourcesList)
);
