import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  postsCount: number;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: string;
  phoneNumber?: string;
}

export interface FollowResponse {
  followers: number;
  following: number;
}

const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },


 


};

export default userService;

