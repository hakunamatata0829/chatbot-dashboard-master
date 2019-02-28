import React, { PureComponent } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Divider,
  Progress,
  Popconfirm,
  Button,
  message,
  Switch,
} from 'antd';
import { connect } from 'dva';
import { db, createLocation } from 'services/firebase';
import LocationFormModal from '../Forms/LocationFormModal';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './LocationsList.less';

class LocationsList extends PureComponent {
  state = {
    modalState: false,
  };

  noModalProps = {
    location: {
      name: '',
      address: '',
      executiveEmails: [],
      openings: [{ quantity: 1, roleId: '' }],
      loading: false,
    },
    title: '',
    onOk() {},
    visible: false,
  };

  newModalProps = {
    location: {
      name: '',
      address: '',
      executiveEmails: [],
      openings: [{ quantity: 1, roleId: (this.props.roles[0] && this.props.roles[0].uid) || '' }],
      loading: false,
    },
    title: 'Add New Location',
    onOk: async location => {
      try {
        await createLocation({ location });
        message.success(`Location "${location.name}" has been created.`);
        this.closeModal();
      } catch (e) {
        message.error(e.message);
      }
    },
    visible: true,
  };

  editModalProps(locationData) {
    const { uid, ...location } = locationData;
    return {
      location: { ...location, loading: false },
      title: 'Edit Location',
      onOk: async location => {
        this.closeModal();
        await db
          .collection('users')
          .doc(this.props.currentUser.uid)
          .collection('locations')
          .doc(uid)
          .set({
            ...location,
          });
        message.success(`Location "${location.name}" has been updated.`);
      },
      visible: true,
    };
  }

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: text => <a href="javascript:;">{text}</a>,
    },
    {
      title: '',
      dataIndex: 'enableDisplay',
      key: 'enableDisplay',
      render: (text, record) => (
        <Switch defaultChecked={text} onChange={((e) => this.onChangeDisplay(record.uid, text))} />
      ),
      
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Openings',
      key: 'openings',
      render: (text, record) => {
        const count = record.openings.reduce((acc, opening) => {
          acc += opening.quantity;
          return acc;
        }, 0);
        return <span>{count}</span>;
      },
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
            title="Are you sure you wish to delete this location?"
            onConfirm={() => {
              db.collection('users')
                .doc(this.props.currentUser.uid)
                .collection('locations')
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

  onChangeDisplay = (uid, text) => {
    
    text = !text;
    this.setState({ enableDisplay: text });
      try {
           db.collection('users')
            .doc(this.props.currentUser.uid)
            .collection('locations')
            .doc(uid)
            .update({enableDisplay: text});

            message.success(`Location status has been updated.`);
        
      } catch (e) {
        message.error(e.message);
      }
    
    

  };
  get openingsCount() {
    return this.props.locations.reduce((acc, location) => {
      location.openings.forEach(opening => {
        acc += opening.quantity;
      });
      return acc;
    }, 0);
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

  addNewLocation = () => {
    this.setState({ modalState: true });
  };

  closeModal = () => {
    this.setState({ modalState: false });
  };

  Info = ({ title, value, bordered }) => (
    <div className={styles.headerInfo}>
      <span>{title}</span>
      <p>{value}</p>
      {bordered && <em />}
    </div>
  );

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
          value = 1;
          break;
        case 'biz':
          value = 5;
          break;
        case 'agency':
          value = 10;
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

  InfoMeter = ({ title, value, bordered, direction }) => (
    <div className={styles.headerInfo} style={{ float: direction }}>
      <h3 style={{ fontWeight: 'bold', margin: 0, textAlign: 'center' }}>{value}</h3>
      <span style={{ display: 'flex', justifyContent: 'center' }}>{title}</span>
      {/* {bordered && <em />} */}
    </div>
  );

  upgradePlan = () => {
    this.props.history.push('/billing/plans');
  };

  render() {
    const { Info, InfoMeter } = this;
    const { isStripeUser, hasValidSubscription, planName, value } = this.getMeteredValues();
    const totalLocationsCreated = this.props.locations.length;

    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card bordered={false}>
            <Row>
              <Col sm={8} xs={24}>
                <Info title="Locations" value={this.props.locations.length} bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="Job Openings" value={this.openingsCount} bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="Applicants" value={this.props.applicants.length} boredered />
              </Col>
            </Row>
          </Card>
          {value !== 'lifetime' ? (
            <Card bordered={false} style={{ margin: '20px 0' }}>
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
                <h4 style={{ fontWeight: 'bold', display: 'inline' }}>Number of Locations</h4>
                <h4 style={{ float: 'right' }}>{totalLocationsCreated}</h4>
              </div>
              <Progress
                percent={parseFloat(((totalLocationsCreated / value) * 100).toFixed(2))}
                status="active"
                showInfo={false}
                style={{ marginBottom: '20px' }}
              />
              <Row>
                <Col sm={8} xs={24}>
                  <InfoMeter
                    title="Current Locations"
                    value={totalLocationsCreated}
                    bordered
                    direction="left"
                  />
                </Col>
                <Col sm={8} xs={24}>
                  <InfoMeter
                    title="Used"
                    value={`${((totalLocationsCreated / value) * 100).toFixed(2)} %`}
                    bordered
                    direction="center"
                  />
                </Col>
                <Col sm={8} xs={24}>
                  <InfoMeter
                    title="Maximum Locations For Current Plan"
                    value={value}
                    boredered
                    direction="right"
                  />
                </Col>
              </Row>
            </Card>
          ) : null}
          <Card className={styles.listCard} bordered={false} style={{ marginTop: 24 }}>
            <div className={styles.tableList}>
              <div className={styles.tableListOperator}>
                <Button
                  icon="plus"
                  type="primary"
                  onClick={this.addNewLocation}
                  disabled={totalLocationsCreated === value ? true : false}
                >
                  Add
                </Button>
                {totalLocationsCreated === value ? (
                  <p style={{ color: 'red' }}>
                    *You exhausted location creation limit upgrade the plan to add more locations.
                  </p>
                ) : null}
              </div>
            </div>
            <Table columns={this.columns} dataSource={this.props.locations} rowKey="name" />
          </Card>
          <LocationFormModal
            {...this.modalProps}
            onCancel={this.closeModal}
            roles={this.props.roles}
          />
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({ user, locations, roles, applicants }) => ({
  currentUser: user.currentUser,
  locations,
  roles,
  applicants,
}))(LocationsList);
