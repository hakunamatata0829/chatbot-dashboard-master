import React, { PureComponent } from 'react';
import { Table, Card, Button, Divider, Popconfirm } from 'antd';
import { db, storageRef } from 'services/firebase';
import { connect } from 'dva';
import styles from './LocationsList.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { CSVDownload } from 'react-csv';
import { CSVLink } from 'react-csv';
import ApplicantFormModal from '../Forms/ApplicantFormModal';
import Popup from 'reactjs-popup';
import Styles from './ApplicantsList.css';
import * as Converter from './TimeConverter';

const fileNameRegExp = new RegExp(String.raw`\w+\.\w+$`);

const downloadCV = cv => async () => {
  const url = await storageRef.child(cv).getDownloadURL();
  const link = document.createElement('a');
  link.download = fileNameRegExp.exec(cv).toString();
  link.href = url;
  link.target = '_blank';
  link.click();
};

const data = [];

class ApplicantsList extends PureComponent {
  state = {
    selectedRowKeys: [],
    exportToggle: false,
    downloadCSV: false,
    modalState: false,
    applicantData: {},
    status: 'Connected',
  };
  headers = [
    { label: 'Email ID', key: 'email' },
    { label: 'Applicant Name', key: 'fullname' },
    { label: 'Phone Number', key: 'phoneNumber' },
    { label: 'Location Name', key: 'locationName' },
    { label: 'Location Address', key: 'locationAddress' },
    { label: 'Role Name', key: 'roleName' },
    { label: 'Role Description', key: 'roleDescription' },
    { label: 'Traits', key: 'traits' },
    { label: 'Is Car Required ?', key: 'requireCar' },
    { label: 'Has Car ?', key: 'hasCar' },
    { label: 'Require Past Experience ?', key: 'requirePastExperience' },
    { label: 'Has Previous Experience ?', key: 'hasPreviousExperience' },
  ];
  changeStatus = event => {};
  //get date from timestamp value

  csvData = [];

  columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: text => (
        <a href="javascript:;">
          <Popup
            trigger={<Button className="Styles.button"> {this.state.status} </Button>}
            position="bottom center"
            on="hover"
          >
            <div className={Styles.menu}>
              {/* <div className="header">{title} position </div> */}

              <div
                className={Styles.menuitem1}
                name="Mark Later"
                id="Mark Later"
                onClick={this.changeStatus.bind(this.name)}
              >
                Mark Later
              </div>
              <div
                className={Styles.menuitem2}
                id="Mark Interest"
                onClick={this.changeStatus.bind(this.name)}
              >
                Mark No Interest
              </div>
              <div
                className={Styles.menuitem3}
                id="Mark Replied"
                onClick={this.changeStatus.bind(this.name)}
              >
                Mark Replied
              </div>
              <div
                className={Styles.menuitem4}
                id="Mark Talking"
                onClick={this.changeStatus.bind(this.name)}
              >
                Mark Talking
              </div>
              <div
                className={Styles.menuitem5}
                onClick={this.changeStatus.bind(this.name)}
                id="Mark Old Candidate"
              >
                Mark Old Connect
              </div>
            </div>
          </Popup>
        </a>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: text => {
        if (typeof text !== 'undefined') {
          var date = Converter.timeStamptoDate(text['seconds']);
          return <a href="javascript:;">{date}</a>;
        } else {
          var date = Converter.getTodayDate();
          return <a href="javascript:;">{date}</a>;
        }
      },
      sorter: (a, b) => {
        if (typeof a.date !== 'undefined') {
          var date_a = Converter.timeStamptoDate(a.date['seconds']);
        } else {
          var date_a = Converter.getTodayDate();
        }
        if (typeof b.date !== 'undefined') {
          var date_b = Converter.timeStamptoDate(b.date['seconds']);
        } else {
          var date_b = Converter.getTodayDate();
        }

        if (date_a < date_b) return -1;
        if (date_a > date_b) return 1;
        return 0;
      },
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: text => <a href="javascript:;">{text}</a>,
      sorter: (a, b) => {
        if (a.fullName.toLowerCase() < b.fullName.toLowerCase()) return -1;
        if (a.fullName.toLowerCase() > b.fullName.toLowerCase()) return 1;
        return 0;
      },
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: text => <a href="javascript:;">{text}</a>,
      sorter: (a, b) => {
        if (a.email.toLowerCase() < b.email.toLowerCase()) return -1;
        if (a.email.toLowerCase() > b.email.toLowerCase()) return 1;
        return 0;
      },
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      render: (text, record) => {
        return <span>{record.role.name}</span>;
      },
      sorter: (a, b) => {
        if (a.role.name.toLowerCase() < b.role.name.toLowerCase()) return -1;
        if (a.role.name.toLowerCase() > b.role.name.toLowerCase()) return 1;
        return 0;
      },
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Location',
      key: 'location',
      dataIndex: 'location',
      render: (text, record) => {
        return <span>{record.location.name}</span>;
      },
      sorter: (a, b) => {
        if (a.location.name.toLowerCase() < b.location.name.toLowerCase()) return -1;
        if (a.location.name.toLowerCase() > b.location.name.toLowerCase()) return 1;
        return 0;
      },
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'CV',
      key: 'cv',
      render: (text, record) => {
        return record.cv !== 'skip' ? (
          <a onClick={downloadCV(record.cv)}>Download</a>
        ) : (
          <a disabled>No CV Uploaded</a>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <a
            href="javascript:;"
            onClick={() => this.setState({ applicantData: record, modalState: true })}
          >
            {/*this.setState({ modalState: record }}*/}
            Edit
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure you wish to delete this location?"
            onConfirm={() => {
              db.collection('users')
                .doc(this.props.currentUser.uid)
                .collection('applicants')
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
  onSelectChange = selectedRowKeys => {
    let buttonShowHide = true;
    if (selectedRowKeys.length == 0) {
      buttonShowHide = false;
    }
    this.csvExport(selectedRowKeys);
    this.setState({
      selectedRowKeys: selectedRowKeys,
      exportToggle: buttonShowHide,
      downloadCSV: false,
    });
  };

  closeModal = () => {
    this.setState({ modalState: false });
  };
  csvExport(selectedData) {
    let filteredArray = this.props.applicants.filter(element => selectedData.includes(element.uid));
    let localCsvData = [];
    filteredArray.map((arrayData, index) => {
      let singleApplicantData = {
        email: arrayData.email,
        fullname: arrayData.fullName,
        phoneNumber: arrayData.phoneNumber,
        locationName: arrayData.location.name,
        locationAddress: arrayData.location.address,
        roleName: arrayData.role.name,
        roleDescription: arrayData.role.description,
        traits: arrayData.role.traits,
        requireCar: arrayData.role.requireCar ? 'Yes' : 'No',
        hasCar: arrayData.hasCar ? 'Yes' : 'No',
        requirePastExperience: arrayData.role.requirePastExperience ? 'Yes' : 'No',
        hasPreviousExperience: arrayData.hasPreviousExperience ? 'Yes' : 'No',
      };
      localCsvData.push(singleApplicantData);
    });
    this.csvData = localCsvData;
  }
  render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      selections: [
        {
          key: 'all-data',
          text: 'Select All Data',
          onSelect: () => {
            this.setState({
              selectedRowKeys: [...Array(Array.length)],
              exportToggle: true,
              downloadCSV: false,
            });
          },
        },
      ],
      onSelection: this.onSelection,
    };

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              {this.state.exportToggle ? (
                <CSVLink
                  className="ant-btn ant-btn-primary exportButtonContainer"
                  data={this.csvData}
                  headers={this.headers}
                >
                  <i className="anticon anticon-download">
                    <svg
                      viewBox="64 64 896 896"
                      className=""
                      data-icon="download"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z" />
                    </svg>
                  </i>
                  <span className="exportButton">Export CSV</span>
                </CSVLink>
              ) : (
                <Button
                  icon="download"
                  type="primary"
                  disabled={true}
                  className="exportButtonContainer"
                >
                  <span className="exportButton">Export CSV</span>
                </Button>
              )}
            </div>
          </div>
          <Table
            columns={this.columns}
            dataSource={this.props.applicants}
            rowKey="uid"
            rowSelection={rowSelection}
          />
          <ApplicantFormModal
            {...this.props}
            visible={this.state.modalState}
            onCancel={this.closeModal}
            applicants={this.state.applicantData}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}

export default connect(({ user, applicants }) => ({
  currentUser: user.currentUser,
  applicants,
}))(ApplicantsList);
