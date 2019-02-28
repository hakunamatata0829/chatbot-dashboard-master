import React, { Component } from 'react';
import { connect } from 'dva';
import PriceCard from 'components/PriceCard';
import { getStripeUser, subscribeToPlan } from 'services/firebase';
import { Card, message, Spin } from 'antd';
import moment from 'moment';
import styles from './index.less';
import store from '../../index';
import { routerRedux } from 'dva/router';
class Plans extends Component {
  state = {
    loading: false,
  };

  cardsProps = [
    {
      price: 29,
      name: 'LITE',
      description:
        'Best for small teams, non-profits, and businesses that way to build a consistant applicant pool',
      uid: 'lite',
      buttonLabel: 'Try Free 14 Days',
      attributes: [
        'Up to 1 locations',
        'Up to 5 Active Roles',
        'Qualified Candidate Inbox',
        'Applicant Routing',
        '24/7 Support',
        'x',
      ],
    },
    {
      price: 99,
      name: 'BIZ',
      description:
        "Best for businesses or organizations who can't afford to have an empty applicant pipeline.",
      uid: 'biz',
      buttonLabel: 'Try Free 14 Days',
      attributes: [
        'Up to 5 locations',
        'Up to 5 Active Roles',
        'Qualified Candidate Inbox',
        'Zapier & Webhooks',
        '24/7 Support',
        'x',
      ],
    },
    {
      price: 299,
      name: 'AGENCY',
      description:
        'Best for hiring departments with upto 10 locations that deal with complex and timely hiring cycles',
      uid: 'agency',
      buttonLabel: 'Try Free 14 Days',
      attributes: [
        'Up to 10 locations',
        'Up to 12 Active Roles',
        'Qualified Candidate Inbox',
        'Zapier & Webhooks',
        '24/7 Support',
        'Custom Redirects',
      ],
    },
    {
      price: 'custom',
      name: 'ENTERPRISE',
      description:
        'Best for large organizations with more than 10 locations that want a new ATS to grow their existing pipeline.',
      uid: 'enterprise',
      buttonLabel: 'Contact Us',
      attributes: [
        'x number of locations',
        'x number of Active Roles',
        'Qualified Candidate Inbox',
        'Zapier & Webhooks',
        'Custom Redirects',
        'Free Account Manager',
      ],
    },
  ];

  componentDidMount() {
    if (!this.props.user || !this.props.user.stripeUser) {
      this.getStripeUser();
    }
  }

  getStripeUser = async () => {
    this.setState({ loading: true });
    await getStripeUser();
    this.setState({ loading: false });
  };

  get cards() {
    return this.cardsProps.map(props => {
      let selected = false;
      if (this.props.user && this.props.user.stripeUser) {
        selected =
          this.props.user.stripeUser.subscriptions.data[0] &&
          props.uid === this.props.user.stripeUser.subscriptions.data[0].plan.id;
      }
      return (
        <PriceCard {...props} key={props.name} onClick={this.subscribeToPlan} selected={selected} />
      );
    });
  }

  subscribeToPlan = async plan => {
    try {
      this.setState({ loading: true });
      if (plan !== 'enterprise') {
        await subscribeToPlan({ plan });
        message.success('Plan was successfully updated.');
        getStripeUser();
        if ('onSubmitSuccess' in this.props) {
          this.props.onSubmitSuccess();
        }
      } else {
        window.location.replace('https://ovrpass.com/enterprise/');
      }
    } catch (e) {
      if (e.details) {
        message.error(e.message);
        if (e.details.error === 'Card Not Found') {
          store.dispatch(
            routerRedux.replace({
              pathname: '/billing/payment',
              state: {
                from: 'billings',
                planType: plan,
              },
            })
          );
        }
      } else {
        message.error('Unable to update plan at this time. Please try again later.');
      }
    }
    this.setState({ loading: false });
  };

  get billingPeriodEnd() {
    if (!this.props.user || !this.props.user.stripeUser) {
      return null;
    }
    let date = '';
    if (this.props.user.stripeUser.subscriptions.data.length >= 1) {
      date = moment(this.props.user.stripeUser.subscriptions.data[0].currentPeriodEnd).format(
        'LLLL'
      );
    } else {
      // date = moment(new Date()).add('days', 14).format('LLLL');
      date = '';
    }
    return <div className={styles.billing_period}>Billing period ends: {date}</div>;
  }

  render() {
    return (
      <Card bordered={false} className="planSelectionPage">
        <Spin spinning={this.state.loading}>
          {!this.props.user || !this.props.user.stripeUser ? this.billingPeriodEnd : null}
          {this.cards}
        </Spin>
      </Card>
    );
  }
}

export default connect(({ user }) => ({
  user: user.currentUser,
}))(Plans);
