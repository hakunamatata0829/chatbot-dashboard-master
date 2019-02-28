import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { SettingsForm } from '../../components/SettingsForm';

class Company extends Component {
  currentUser = {
    companyName: this.props.currentUser.companyName || '',
    welcomeMessage:
      this.props.currentUser.welcomeMessage ||
      'Hey! Looking for a job? We have openings which you might be interested in!',
    successMessage:
      this.props.currentUser.successMessage ||
      'Thank you for taking the time. Your application has been submitted!',
    declineMessage:
      this.props.currentUser.declineMessage ||
      'Sorry to hear that! Best of luck on your job search!',
    language: this.props.currentUser.language || 'en',
    uid: this.props.currentUser.uid,
  };

  onSubmitSuccess = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/billing/payment',
      })
    );
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUser.companyName) {
      this.onSubmitSuccess();
    }
  }

  render() {
    return (
      <SettingsForm
        onSubmitSuccess={this.onSubmitSuccess}
        currentUser={this.currentUser}
        languages={this.props.languages}
      />
    );
  }
}

export default connect(({ languages, user }) => ({ languages, currentUser: user.currentUser }))(
  Company
);
