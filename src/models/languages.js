export default {
  namespace: 'languages',

  state: [],

  effects: {
    *set({ payload }, { put }) {
      yield put({
        type: 'setLanguages',
        payload,
      });
    },
  },

  reducers: {
    setLanguages(_state, action) {
      return action.payload;
    },
  },
};
