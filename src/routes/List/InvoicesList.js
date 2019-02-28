import React, { PureComponent } from 'react';
import { Table, Card, Spin } from 'antd';
import { getInvoices } from 'services/firebase';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import moment from 'moment';
import { routerRedux } from 'dva/router';

class InvoicesList extends PureComponent {
  state = {
    invoices: [],
    loading: false,
  };

  columns = [
    {
      title: 'Plan',
      key: 'plan',
      render: (text, record) => {
        return <span>{record.lines.data[0].plan.nickname}</span>;
      },
    },
    {
      title: 'Amount Due',
      dataIndex: 'amount_due',
      key: 'amount_due',
      render: (text, record) => {
        return <span>{`$ ${text / 100}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>;
      },
    },
    {
      title: 'Amount Paid',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (text, record) => {
        return <span>{`$ ${text / 100}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => {
        return <span>{moment.unix(text).calendar()}</span>;
      },
    },
  ];

  getInvoices = async () => {
    this.setState({ loading: true });
    // const { data } = await getInvoices();
    // this.setState({ invoices: data.data, loading: false });
    await getInvoices()
      .then(response => {
        this.setState({ invoices: response.data.data, loading: false });
      })
      .catch(error => {
        this.setState({ invoices: [], loading: false }, () => {
          message.error(
            'You do not have any paid invoices yet. Please contact support if necessary.'
          );
        });
      });
  };
  componentDidMount() {
    if (
      this.props.currentUser &&
      this.props.currentUser.stripeUser &&
      this.props.currentUser.stripeUser.subscriptions &&
      this.props.currentUser.stripeUser.subscriptions.data.length > 0 &&
      this.props.currentUser.stripeUser.subscriptions.data[0].plan.id === 'enterprise'
    ) {
      this.onSubmitSuccess();
    } else {
      this.getInvoices();
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
    } else {
      this.getInvoices();
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
        <Card bordered={false}>
          <Spin spinning={this.state.loading}>
            <Table columns={this.columns} dataSource={this.state.invoices} rowKey="id" />
          </Spin>
        </Card>
      </PageHeaderLayout>
    );
  }
}

export default InvoicesList;
