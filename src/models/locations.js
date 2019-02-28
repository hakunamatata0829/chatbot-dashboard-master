export default {
  namespace: 'locations',

  state: [],

  effects: {
    *set({ payload }, { put }) {
      yield put({
        type: 'setLocations',
        payload,
      });
    },
  },

  reducers: {
    setLocations(_state, action) {
      return action.payload;
    },
  },
};
