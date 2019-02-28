import React, { Component } from 'react';
import { StripeCard } from '../../components/StripeCard';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';

class Billing extends Component {
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.currentUser &&
      nextProps.currentUser.stripeUser &&
      nextProps.currentUser.stripeUser.sources.total_count > 0
    ) {
      this.onSubmitSuccess();
    }
  }

  onSubmitSuccess = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/onboarding/plans',
      })
    );
  };

  render() {
    return <StripeCard onSubmitSuccess={this.onSubmitSuccess} />;
  }
}

export default connect(({ user }) => ({ currentUser: user.currentUser }))(Billing);
