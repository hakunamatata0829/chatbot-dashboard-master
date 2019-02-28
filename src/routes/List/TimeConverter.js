import { db, storageRef } from 'services/firebase';
import firebase from 'firebase/app';
import 'firebase/firestore';
//convert timestamp to date format
export function timeStamptoDate(text) {
  var a = new Date(text * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  //var month = months[a.getMonth()];
  var month = a.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  var date = a.getDate();
  if (date < 10) {
    date = `0${date}`;
  }
  
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = month + '-' + date + '-' + year; //+ ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

//convert date to timestamp format
export function dateToTimestamp(text) {
  var myDate = text.split('-');
  console.log(myDate[2] + '-' + myDate[0] + '-' + myDate[1]);
  /// var newDate=myDate[0]+","+myDate[1]+","+myDate[2];
  var timeStamp = firebase.firestore.Timestamp.fromDate(
    new Date(myDate[2], myDate[0] - 1, myDate[1])
  );
  return timeStamp;
}

//convert datepicker date to timestamp format
export function datepickerToTimestamp(text) {
  var myDate = text.split('-');
  console.log(myDate[2] + '-' + myDate[0] + '-' + myDate[1]);
  /// var newDate=myDate[0]+","+myDate[1]+","+myDate[2];
  var timeStamp = firebase.firestore.Timestamp.fromDate(new Date(myDate[2], myDate[0], myDate[1]));
  return timeStamp;
}

//get today date
export function getTodayDate() {
  let today = new Date();
  let dd = today.getDate();

  let mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  if (dd < 10) {
    dd = `0${dd}`;
  }

  if (mm < 10) {
    mm = `0${mm}`;
  }
  today = `${mm}-${dd}-${yyyy}`;

  return today;
  today = `${mm}/${dd}/${yyyy}`;

  today = `${dd}-${mm}-${yyyy}`;

  today = `${dd}/${mm}/${yyyy}`;
}
