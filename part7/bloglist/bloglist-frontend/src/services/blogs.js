import axios from 'axios';
const baseUrl = '/api/blogs';

let token = null;

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const setToken = (newToken) => {
  token = `bearer ${newToken}`;
};

const getAuthConfig = () => {
  return { headers: { Authorization: token } };
};

const create = async (newBlog) => {
  const response = await axios.post(baseUrl, newBlog, getAuthConfig());
  return response.data;
};

const updateBlog = async (newBlog) => {
  const response = await axios.put(`${baseUrl}/${newBlog.id}`, newBlog, getAuthConfig());
  return response.data;
};

const addComment = async (comment, id) => {
  const response = await axios.post(`${baseUrl}/${id}/comments`, { comment }, getAuthConfig());
  return response.data;
};

const deleteBlog = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`, getAuthConfig());
  return response.data;
};

export default { getAll, setToken, create, updateBlog, deleteBlog, addComment };
