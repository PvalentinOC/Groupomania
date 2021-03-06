import { createStore } from 'vuex'

const axios = require('axios');

const instance = axios.create({
  baseURL: 'http://localhost:3001/user/',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});

let user = localStorage.getItem('user');
if (!user) {
  user = {
    userID: -1,
    token: '',
  };
} else {
  try{
  user = JSON.parse(user);
  instance.defaults.headers.common['Authorization'] = user.token;
  } catch (ex) {
    user = {
      userID: -1,
      token: '',
    };
  }
}


const store = createStore({
  state: {
    status: '',
    user: user,
    userInfos: {
      username: '',
      email: '',
      password: '',
    },
    post: {
      title: '',
      data: '',
    },
  },
  mutations: {
    setStatus: function(state, status) {
      state.status = status;
    },
    logUser: function(state, user) {
      instance.defaults.headers.common['Authorization'] = user.token;
      localStorage.setItem('user', JSON.stringify(user));
      state.user = user;
    },
    userInfos: function(state, userInfos) {
      state.userInfos = userInfos;
    },
    logout: function(state) {
      state.user = {
        userID : -1,
        token : '', 
      }
      localStorage.removeItem('user');
    },
    statePoste: function(state, post) {
      state.post = post;
    },
    addStatePost: function(state, post){
      state.post.unshift(post)
      //console.log(state.post);
    },
    deleteStatePoste: function(state,postID){
      let post = state.post.filter(p => p.ID  != postID);
      state.post = post
    },
    commente: function(state, comment) {
      state.comment = comment;
    },
    addStateComment: function(state,comment){
      //console.log(state)
      let postIndex = state.post.findIndex(post => post.ID === comment.post_ID)
      //console.log(postIndex)
      if (state.post[postIndex].comments) {
        state.post[postIndex].comments.unshift(comment)
      } else {
        state.post[postIndex].comments = [comment]
      }
    },
    deleteStateComment: function(state,comment){
      let posts = [...state.post]
      let postIndex = posts.findIndex(post => post.ID === comment.post_ID)
      //console.log(postIndex)
      let commentIndex = posts[postIndex].comments.findIndex(com => com.ID === comment.ID)
      //console.log(commentIndex)
      posts[postIndex].comments.splice(commentIndex,1);
      state.post = [...posts]
    },
  },
  actions: {
    createAccount: ({ commit }, userInfos) => {
      commit('setStatus', 'loading');
      return new Promise((resolve, reject) => {
      axios.post('http://localhost:3001/user/signup', userInfos)
      .then(function (response) {
        commit('setStatus', 'created');
        resolve(response);
      })
      .catch(function (error) {
        commit('setStatus', 'error_create');
        reject(error);
      });
      });
    },
    login: ({ commit }, userInfos) => {
      return new Promise((resolve, reject) => {   
      commit('setStatus', 'loading');
      axios.post('http://localhost:3001/user/login', userInfos)
      .then(function (response) {
        commit('setStatus', '');
        commit('logUser', response.data);
        resolve(response);
      })
      .catch(function (error) {
        commit('setStatus', 'error_login');
        reject(error);
      });
      });
    },
    getUserInfos: ({ commit }) => {
      let token = JSON.parse(localStorage.getItem('user')).token;
      let config = {
        headers:{
          "Authorization":"Barear "+ token
        }
      }
      axios.get('http://localhost:3001/user/', config)
      .then(function (response) {
        commit('userInfos', response.data.user[0][0]);
        //console.log(response.data.user[0][0])
      })
      .catch(function (error) {
        throw error
      });
    },
    createPost({ commit }, post) {
      let token = JSON.parse(localStorage.getItem('user')).token;
      let config = {
        headers:{
          "Authorization":"Barear "+ token,
        }
      }
      console.log(post);
      return new Promise((resolve, reject) => {
        axios.post('http://localhost:3001/post/', post,  config )
          .then((response) => {
            //console.log("createPost", response.data);
            commit("addStatePost", response.data.newPost);
            //console.log(response.data);
            resolve(response);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      });
    },
    getAllPost: ({ commit }) => {
      let token = JSON.parse(localStorage.getItem('user')).token;
      let config = {
        headers:{
          "Authorization":"Barear "+ token
        }
      }
      axios.get('http://localhost:3001/post/', config)
      .then(function (response) {
        commit('statePoste', response.data);
        //console.log(response.data);
      })
      .catch(function (error) {
        throw error
      });
    },
    deletePost({ commit }, post) {
      let token = JSON.parse(localStorage.getItem('user')).token;
      let config = {
        headers:{
          "Authorization":"Barear "+ token
        }
      }
    axios.delete(`http://localhost:3001/post/${post.ID}`, config)
    commit('deleteStatePoste', post.ID);
    },
    createComment({ commit }, comment) {
      let token = JSON.parse(localStorage.getItem('user')).token;
      let config = {
        headers:{
          "Authorization":"Barear "+ token
        }
      }
      const commentData = comment;
      //console.log(commentData);
      const createComment = `http://localhost:3001/comment/${comment.ID}`
      return new Promise((resolve, reject) => {
        axios.post(createComment, commentData,  config  )
          .then((response) => {
            //console.log(response);
            commit("addStateComment", response.data.comment[0][0]);
            resolve(response);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      });
    },
    deleteComment({ commit }, comment) {
      let token = JSON.parse(localStorage.getItem('user')).token;
      let config = {
        headers:{
          "Authorization":"Barear "+ token
        }
      }
      //console.log(comment)
    axios.delete(`http://localhost:3001/comment/${comment.ID}`, config)
    .then((response) => {
      console.log(response);
      commit('deleteStateComment', comment);
    })
    },
  },
})

export default store;
