import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Switch,
  InputNumber,
  Collapse,
  Modal,
  AutoComplete,
  Tooltip,
  Tag,
  Icon,
  message,
  DatePicker,
} from 'antd';
import { db } from 'services/firebase';
import { placesAutocomplete } from 'services/firebase';
import _ from 'lodash';
import * as Converter from '../List/TimeConverter';
import moment from 'moment';

const FormItem = Form.Item;
const { Option } = Select;

const Panel = Collapse.Panel;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 10 },
  },
};
const dateFormat = 'MM-DD-YYYY';
let selectDate = '';

class ApplicantFormModal extends PureComponent {
  state = {
    cv: '',
    email: '',
    fullName: '',
    hasPreviousExperience: false,
    location: {},
    phoneNumber: '',
    question: {},
    role: {},
    roleDescription: false,
    roleTraits: false,
    uid: '',
    date: '',
  };

  componentWillReceiveProps(props) {
    this.setState({ ...props.applicants });
    if (props.applicants.date == null) this.setState({ date: '' });
    //console.log(props.applicants)
  }
  componentWillUpdate(props) {
    this.setState({ ...props.applicants });
    if (props.applicants.date == null) this.setState({ date: '' });
  }

  handleInputChange = e => {
    if (e.target.name == 'date') {
      var date = Converter.dateToTimestamp(e.target.value);
      this.setState({ [e.target.name]: date });
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }

  };

  handleDatePickerChange = (date, dateString, name) => {
    if (dateString !== '') {
      var newdate = Converter.dateToTimestamp(dateString);
      selectDate = Converter.datepickerToTimestamp(dateString);
      this.setState({ date: newdate });
    } else {
      this.setState({ date: '' });
      selectDate = '';
    }    
  };

  get valid() {
    if (this.state.fullName.length < 0) {
      return false;
    }
    if (this.state.email.length < 0) {
      return false;
    }
    if (this.state.phoneNumber.length < 0) {
      return false;
    }

    return true;
  }
  handleChange = value => {
    console.log(`selected ${value}`);
    var past = false;
    if (value == '1') past = true;
    this.setState({ hasPreviousExperience: past });
  };

  onSubmit = async e => {
    const uid = this.state.uid;
    this.setState({
      loading: true,
    });
    try {
      await db
        .collection('users')
        .doc(this.props.currentUser.uid)
        .collection('applicants')
        .doc(uid)
        .set({
          ...this.state,
        });
      this.props.onCancel();
      message.success(`Applicant "${this.state.fullName}" has been updated.`);
      this.setState({
        loading: false,
      });
    } catch (e) {
      message.error(`Applicant "${this.state.fullName}" Update Failed`);
    }
  };

  render() {
    var appDate = this.state.date
      ? Converter.timeStamptoDate(this.state.date['seconds'])
      : Converter.getTodayDate();

    return (
      <Modal
        width={1600}
        title="Edit Applicants"
        visible={this.props.visible}
        onOk={this.onSubmit}
        // onCancel={this.props.onCancel}
        onCancel={this.props.onCancel}
        okButtonProps={{
          disabled: !this.valid,
          loading: this.state.loading,
        }}
      >
        <Form style={{ marginTop: 8 }}>
          <FormItem {...formItemLayout} label="Date">
            <DatePicker
              defaultValue={moment(appDate, dateFormat)}
              format={dateFormat}
              value={moment(appDate, dateFormat)}
              onChange={(date, dateString) => this.handleDatePickerChange(date, dateString, 'date')}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Applicant Full Name">
            <Input
              placeholder="Applicant Name"
              value={this.state.fullName}
              name="fullName"
              onChange={this.handleInputChange}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Email ID">
            <Input
              placeholder="Applicant Name"
              value={this.state.email}
              name="email"
              onChange={this.handleInputChange}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="Phone Number">
            <Input
              placeholder="Applicant Name"
              value={this.state.phoneNumber}
              name="phoneNumber"
              onChange={this.handleInputChange}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="CV">
            {this.state.cv !== 'skip' ? (
              <Input
                placeholder="CV Url"
                value={this.state.cv}
                name="cv"
                onChange={this.handleInputChange}
              />
            ) : (
              <a disabled>No CV Uploaded</a>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Has past experience?">
            <Select
              style={{ width: 120 }}
              defaultValue={this.state.hasPreviousExperience ? 'Yes' : 'No'}
              onChange={this.handleChange}
              value={this.state.hasPreviousExperience ? 'Yes' : 'No'}
            >
              <Option value="1">Yes</Option>
              <Option value="0">No</Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ApplicantFormModal;
