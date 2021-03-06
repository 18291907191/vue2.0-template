import { userGetareas, addUser, userConfig, userLogin } from '@/api/user'
import { getToken, setToken, removeToken, setCookie } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  userId: null,
  province: [], // 省份数据
  baseConfigInfo: {}, // 用户基础配置信息
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  // 设置登录用户id
  SET_USERID: (state,userId) => {
    state.userId = userId;
  },
  // 设置省份
  SET_PROVINCE: (state,data) => {
    state.province = data;
  },
  // 设置用户基础配置信息
  SET_BASECONIFGINFO: (state, data) => {
    state.baseConfigInfo = data;
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      userLogin({ username: username.trim(), password: password }).then(res => {
        console.log('52', res);
        if (res === "{}") {
          reject('账号密码有误');
          return;
        }
        // commit('SET_USERID', res.id); // 设置userId；
        commit('SET_TOKEN', 'admin-token');
        setToken('admin-token')
        // setCookie('user_id',res.id)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit }) {
    return new Promise((resolve) => {
      let data = {
        avatar: "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
        introduction: "I am a super administrator",
        name: "Super Admin",
        roles: ["admin"]
      }
      const { roles, name, avatar, introduction } = data
      commit('SET_ROLES', roles)
      commit('SET_NAME', name)
      commit('SET_AVATAR', avatar)
      commit('SET_INTRODUCTION', introduction)
      resolve(data)
    })
  },

  // user logout
  logout({ commit }) {
    return new Promise((resolve) => {
      commit('SET_TOKEN', '');
      commit("SET_USERID", '');
      commit('SET_ROLES', []);
      removeToken();
      resetRouter();
      setCookie('user_id', '')
      resolve();
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      const token = role + '-token'
      commit('SET_TOKEN', token)
      setToken(token)
      const { roles } = await dispatch('getInfo')
      resetRouter()
      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  },
  // 添加用户
  // eslint-disable-next-line no-unused-vars
  addUser({commit}, params) {
    return new Promise((resolve,reject) => {
      addUser(params).then(res => {
        resolve(res);
      }, err => {
        reject(err);
      })
    })
  },

  // 查询省份数据
  userGetareas({ commit }, params) {
    return new Promise((resolve,reject) => {
      userGetareas(params).then(res => {
        commit('SET_PROVINCE', res);
        resolve(res);
      },err => {
        reject(err);
      })
    })
  },
  // 查询用户基础配置信息
  fetchBaseConfigInfo({ commit }, params) {
    return new Promise((resolve,reject) => {
      userConfig(params).then(res => {
        commit('SET_BASECONIFGINFO', res);
        resolve(res);
      }, err => {
        reject(err);
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
