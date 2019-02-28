import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/functions';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/database';
import { formatPhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import store from '../index';
import { routerRedux } from 'dva/router';
import { message } from 'antd';

const config = {
  apiKey: 'AIzaSyCgIjPcPgbkf4x6xaollFT72l8-2gWMtQg',
  authDomain: 'hiremate-99220.firebaseapp.com',
  databaseURL: 'https://hiremate-99220.firebaseio.com',
  projectId: 'hiremate-99220',
  storageBucket: 'hiremate-99220.appspot.com',
  messagingSenderId: '1045092165800',
};

firebase.initializeApp(config);

const settings = { /* your settings... */ timestampsInSnapshots: true };
firebase.firestore().settings(settings);

const db = firebase.firestore();
const disposers = [];
const userProfileRef = firebase.database().ref();
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    store.dispatch({
      type: 'login/login',
    });
    const { displayName, email, uid } = user;
    const userRef = firebase.auth().currentUser;

    const payload = {
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      displayName,
      email,
      uid,
      userRef,
    };
    store.dispatch({
      type: 'user/setCurrent',
      payload,
    });
    listenUser();
    listenLocations();
    listenRoles();
    listenApplicants();
    listenLanguages();
    store.dispatch(
      routerRedux.push({
        pathname: '/onboarding/plans',
      })
    );
    getStripeUser();
    // getStripeUser();
  } else {
    disposers.forEach(disposer => disposer());
    disposers.splice(0, disposers.length);
    store.dispatch({
      type: 'user/setCurrent',
      payload: {},
    });
    store.dispatch({
      type: 'locations/setLocations',
      payload: [],
    });
    store.dispatch({
      type: 'roles/setRoles',
      payload: [],
    });
    store.dispatch({
      type: 'applicants/setApplicants',
      payload: [],
    });
    store.dispatch({
      type: 'login/logout',
    });
    logout();
  }
});

function listenUser() {
  const disposer = db
    .collection('users')
    .doc(firebase.auth().currentUser.uid)
    .onSnapshot(doc => {
      const payload = {
        ...store.getState().user.currentUser,
        ...doc.data(),
      };
      store.dispatch({
        type: 'user/setCurrent',
        payload,
      });
    });
  disposers.push(disposer);
}

function listenLocations() {
  const disposer = db
    .collection('users')
    .doc(firebase.auth().currentUser.uid)
    .collection('locations')
    .onSnapshot(resp => {
      const locations = resp.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
      store.dispatch({
        type: 'locations/setLocations',
        payload: locations,
      });
    });
  disposers.push(disposer);
}

function listenRoles() {
  const disposer = db
    .collection('users')
    .doc(firebase.auth().currentUser.uid)
    .collection('roles')
    .onSnapshot(resp => {
      const roles = resp.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
      store.dispatch({
        type: 'roles/setRoles',
        payload: roles,
      });
    });
  disposers.push(disposer);
}

function listenApplicants() {
  const disposer = db
    .collection('users')
    .doc(firebase.auth().currentUser.uid)
    .collection('applicants')
    .onSnapshot(async resp => {
      const applicants = resp.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
      store.dispatch({
        type: 'applicants/setApplicants',
        payload: applicants,
      });
    });
  disposers.push(disposer);
}

function listenLanguages() {
  const disposer = db.collection('languages').onSnapshot(async resp => {
    const languages = resp.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
    store.dispatch({
      type: 'languages/setLanguages',
      payload: languages,
    });
    disposers.push(disposer);
  });
}

async function login({ email, password }) {
  return await firebase.auth().signInWithEmailAndPassword(email, password);
}

async function register({ email, password, phone }) {
  var user = null;
  return await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      user = firebase.auth().currentUser;
      return updatePhoneNumber({
        uid: user.uid,
        phone: formatPhoneNumber(phone, 'E.164').replace(/ /g, ''),
      })
        .then(data => {
          return data;
        })
        .catch(err => {
          console.log('error', err.result.errorInfo.code);
          message.error(err.result.errorInfo.code);
          return err;
        });
    })
    .catch(error => {
      return error;
    });
}

function sendResetPassword({ email }) {
  const auth = firebase.auth();
  return auth
    .sendPasswordResetEmail(email)
    .then(function() {
      message.success('Password Reset Link Sent to Registered Email ID');
      return { success: 'Password Reset Link Sent to Registered Email ID' };
    })
    .catch(function(error) {
      message.error(error.toString());
      return { error: error.toString() };
    });
}

function logout() {
  return firebase.auth().signOut();
}

async function getStripeUser(count = 0) {
  if (count >= 3) {
    logout();
    return;
  }
  try {
    const data = await firebase.functions().httpsCallable('getStripeUser')();
    const payload = {
      ...store.getState().user.currentUser,
      stripeUser: {
        ...data.data,
      },
    };
    store.dispatch({
      type: 'user/setCurrent',
      payload,
    });
    if (payload.stripeUser.subscriptions.data.length <= 0) {
      store.dispatch(
        routerRedux.replace({
          pathname: '/onboarding/plans',
        })
      );
    } else if (payload.stripeUser.sources.data.length <= 0) {
      if (
        payload.stripeUser &&
        payload.stripeUser.subscriptions &&
        payload.stripeUser.subscriptions.data.length > 0 &&
        payload.stripeUser.subscriptions.data[0].plan.id === 'enterprise'
      ) {
        if (!payload.companyName) {
          store.dispatch(
            routerRedux.replace({
              pathname: '/settings',
            })
          );
        }
      } else {
        store.dispatch(
          routerRedux.replace({
            pathname: '/billing/payment',
          })
        );
      }
    } else if (!payload.companyName) {
      store.dispatch(
        routerRedux.replace({
          pathname: '/settings',
        })
      );
    }
  } catch (e) {
    setTimeout(() => getStripeUser(count + 1), 2000);
    return;
  }
}

const placesAutocomplete = firebase.functions().httpsCallable('placesAutocomplete');
const addCard = firebase.functions().httpsCallable('addCard');
const deleteCard = firebase.functions().httpsCallable('deleteCard');
const createRole = firebase.functions().httpsCallable('createRole');
const createLocation = firebase.functions().httpsCallable('createLocation');
const updateCardInfo = firebase.functions().httpsCallable('updateCardInfo');
const subscribeToPlan = firebase.functions().httpsCallable('subscribeToPlan');
const cancelSubscription = firebase.functions().httpsCallable('cancelSubscription');
const getInvoices = firebase.functions().httpsCallable('getInvoices');
const changeDefaultSource = firebase.functions().httpsCallable('changeDefaultSource');
const storageRef = firebase.storage().ref();
const updatePhoneNumber = firebase.functions().httpsCallable('updatePhoneNumber');
export {
  addCard,
  deleteCard,
  cancelSubscription,
  createRole,
  createLocation,
  updateCardInfo,
  db,
  updatePhoneNumber,
  getInvoices,
  getStripeUser,
  changeDefaultSource,
  sendResetPassword,
  login,
  logout,
  placesAutocomplete,
  register,
  storageRef,
  subscribeToPlan,
};
