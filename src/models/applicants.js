export default {
  namespace: 'applicants',

  state: [],

  effects: {
    *set({ payload }, { put }) {
      yield put({
        type: 'setApplicants',
        payload,
      });
    },
  },

  reducers: {
    setApplicants(_state, action) {
      return action.payload;
    },
  },
};
