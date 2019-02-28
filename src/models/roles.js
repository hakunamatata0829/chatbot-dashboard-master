export default {
  namespace: 'roles',

  state: [],

  effects: {
    *set({ payload }, { put }) {
      yield put({
        type: 'setRoles',
        payload,
      });
    },
  },

  reducers: {
    setRoles(_state, action) {
      return action.payload;
    },
  },
};
