import React, { PureComponent } from 'react';
import { Button, Table, Row, Col, Card, Progress, Divider, Popconfirm, message } from 'antd';
import RoleFormModal from '../Forms/RoleFormModal';
import { db, createRole } from 'services/firebase';
import { connect } from 'dva';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './RolesList.less';

class RolesList extends PureComponent {
  state = {
    modalState: false,
  };

  noModalProps = {
    role: {
      name: '',
      description: '',
      descriptionReply: '',
      activateDescriptionReply: false,
      traits: '',
      traitsReply: '',
      activateTraitsReply: false,
      requirePastExperience: false,
      requireCar: false,
      loading: false,
    },
    title: '',
    onOk() {},
    visible: false,
  };

  newModalProps = {
    role: {
      name: '',
      description: '',
      descriptionReply: '',
      activateDescriptionReply: false,
      traits: '',
      traitsReply: '',
      activateTraitsReply: false,
      requirePastExperience: false,
      requireCar: false,
      loading: false,
    },
    title: 'Add New Role',
    onOk: async role => {
      try {
        await createRole({ role });
        message.success(`Role "${role.name}" has been created.`);
        this.closeModal();
      } catch (e) {
        message.error(e.message);
        console.error(e.message);
      }
    },
    visible: true,
  };

  editModalProps(roleData) {
    const { uid, ...role } = roleData;
    return {
      role: { ...role, loading: false },
      title: 'Edit Role',
      onOk: async role => {
        await db
          .collection('users')
          .doc(this.props.currentUser.uid)
          .collection('roles')
          .doc(uid)
          .set({
            ...role,
          });
        message.success(`Role "${role.name}" has been updated.`);
        this.closeModal();
      },
      visible: true,
    };
  }

  get modalProps() {
    if (this.state.modalState === false) {
      return this.noModalProps;
    }
    if (this.state.modalState === true) {
      return this.newModalProps;
    }
    return this.editModalProps(this.state.modalState);
  }

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: text => <a href="javascript:;">{text}</a>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '75%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <a href="javascript:;" onClick={() => this.setState({ modalState: record })}>
            Edit
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure to delete this role?"
            onConfirm={() => {
              db.collection('users')
                .doc(this.props.currentUser.uid)
                .collection('roles')
                .doc(record.uid)
                .delete();
            }}
          >
            <a href="javascript:;">Delete</a>
          </Popconfirm>
        </span>
      ),
    },
  ];

  addNewRole = () => {
    this.setState({ modalState: true });
  };

  closeModal = () => {
    this.setState({ modalState: false });
  };

  getMeteredValues = () => {
    let isStripeUser =
      this.props.currentUser.stripeUser &&
      this.props.currentUser.stripeUser.subscriptions &&
      this.props.currentUser.stripeUser.subscriptions.data.length > 0
        ? true
        : false;
    let planName = '';
    let value = '';
    let hasValidSubscription = false;
    if (isStripeUser) {
      hasValidSubscription =
        this.props.currentUser.stripeUser.subscriptions.data.length > 0 ? true : false;
      planName = this.props.currentUser.stripeUser.subscriptions.data[0].plan.id;
      switch (planName) {
        case 'lite':
          value = 5;
          break;
        case 'biz':
          value = 5;
          break;
        case 'agency':
          value = 12;
          break;
        case 'enterprise':
          value = 'lifetime';
          break;
        default:
          value = 0;
          break;
      }
    }
    return {
      isStripeUser: isStripeUser,
      hasValidSubscription: hasValidSubscription,
      planName: planName,
      value: value,
    };
  };

  Info = ({ title, value, bordered, direction }) => (
    <div className={styles.headerInfo} style={{ float: direction }}>
      <h3 style={{ fontWeight: 'bold', margin: 0, textAlign: 'center' }}>{value}</h3>
      <span style={{ display: 'flex', justifyContent: 'center' }}>{title}</span>
      {bordered && <em />}
    </div>
  );

  upgradePlan = () => {
    this.props.history.push('/billing/plans');
  };

  render() {
    const { Info } = this;
    const { isStripeUser, hasValidSubscription, planName, value } = this.getMeteredValues();
    const totalRolesCreated = this.props.roles.length;

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button
                icon="plus"
                type="primary"
                onClick={this.addNewRole}
                disabled={totalRolesCreated === value ? true : false}
              >
                Add
              </Button>
              {totalRolesCreated === value ? (
                <p style={{ color: 'red' }}>
                  *You exhausted role creation limit upgrade the plan to add more roles.
                </p>
              ) : null}
            </div>
          </div>
          <Table columns={this.columns} dataSource={this.props.roles} rowKey="name" />
        </Card>
        {value !== 'lifetime' ? (
          <Card bordered={false} style={{ marginTop: '20px' }}>
            <h4 style={{ fontWeight: 'bold', display: 'flex' }}>
              Usage |
              <div className="showActivePlan">
                <p style={{ background: 'aqua', margin: '0 20px' }}>{planName.toUpperCase()}</p>
              </div>
              <Button
                icon="plus"
                style={{ maxHeight: '23px' }}
                type="primary"
                onClick={this.upgradePlan}
              >
                Upgrade Plan
              </Button>
            </h4>
            <div>
              <h4 style={{ fontWeight: 'bold', display: 'inline' }}>
                Current Number of Active Roles
              </h4>
              <h4 style={{ float: 'right' }}>{totalRolesCreated}</h4>
            </div>
            <Progress
              percent={((totalRolesCreated / value) * 100).toFixed(2)}
              status="active"
              showInfo={false}
              style={{ marginBottom: '20px' }}
            />
            <Row>
              <Col sm={8} xs={24}>
                <Info
                  title="Current Active Roles"
                  value={totalRolesCreated}
                  bordered
                  direction="left"
                />
              </Col>
              <Col sm={8} xs={24}>
                <Info
                  title="Used"
                  value={`${parseFloat(((totalRolesCreated / value) * 100).toFixed(2))} %`}
                  bordered
                  direction="center"
                />
              </Col>
              <Col sm={8} xs={24}>
                <Info
                  title="Maximum Active Roles For Current Plan"
                  value={value}
                  boredered
                  direction="right"
                />
              </Col>
            </Row>
          </Card>
        ) : null}
        <RoleFormModal {...this.modalProps} onCancel={this.closeModal} />
      </PageHeaderLayout>
    );
  }
}

export default connect(({ user, roles }) => ({
  currentUser: user.currentUser,
  roles,
}))(RolesList);
