import React, { Component } from 'react';
import PlansComponent from 'components/Plans';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';

class Plans extends Component {
  componentDidMount() {
    if (
      this.props.currentUser &&
      this.props.currentUser.stripeUser &&
      this.props.currentUser.stripeUser.subscriptions &&
      this.props.currentUser.stripeUser.subscriptions.data.length > 0
    ) {
      this.onSubmitSuccess();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.currentUser &&
      nextProps.currentUser.stripeUser &&
      nextProps.currentUser.stripeUser.subscriptions &&
      nextProps.currentUser.stripeUser.subscriptions.data.length > 0
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
    return <PlansComponent onSubmitSuccess={this.onSubmitSuccess} />;
  }
}

export default connect(({ user }) => ({ currentUser: user.currentUser }))(Plans);
