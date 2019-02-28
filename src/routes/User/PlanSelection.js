import React, { Component } from 'react';
import { connect } from 'dva';
import Plans from 'components/Plans';
import { getStripeUser, cancelSubscription, subscribeToPlan } from 'services/firebase';
import { Button, Spin } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './PlanSelection.less';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
class PlanSelection extends Component {
  state = {
    loading: false,
  };
  componentDidMount() {
    if (
      this.props.user &&
      this.props.user.stripeUser &&
      this.props.user.stripeUser.subscriptions &&
      this.props.user.stripeUser.subscriptions.data.length > 0 &&
      this.props.user.stripeUser.subscriptions.data[0].plan.id === 'enterprise'
    ) {
      this.onSubmitSuccess();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.user &&
      nextProps.user.stripeUser &&
      nextProps.user.stripeUser.subscriptions &&
      nextProps.user.stripeUser.subscriptions.data.length > 0 &&
      nextProps.user.stripeUser.subscriptions.data[0].plan.id === 'enterprise'
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

  getStripeUser = async () => {
    this.setState({ loading: true });
    await getStripeUser();
    this.setState({ loading: false });
  };

  cancelSubscription = async () => {
    this.setState({ loading: true });
    try {
      await cancelSubscription();
      message.success('Plan Subscription Cancelled Successfully');
      await getStripeUser();
    } catch (e) {
      message.error('Plan Subscription Cancel Unsuccessful');
    }
    this.setState({ loading: false });
  };

  render() {
    return (
      <PageHeaderLayout>
        <Spin spinning={this.state.loading}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button.Group>
                <Button
                  icon="reload"
                  type="primary"
                  onClick={this.getStripeUser}
                  disabled={this.state.loading}
                >
                  Refresh
                </Button>
                <Button
                  icon="close-circle"
                  type="secondary"
                  onClick={this.cancelSubscription}
                  disabled={this.state.loading}
                >
                  Cancel Current Plan
                </Button>
              </Button.Group>
            </div>
          </div>
          <Plans />
        </Spin>
      </PageHeaderLayout>
    );
  }
}

export default connect(({ user }) => ({
  user: user.currentUser,
}))(PlanSelection);
