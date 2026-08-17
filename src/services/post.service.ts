import api from './api';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}

export interface CreatePostData {
  content: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface PostFilter {
  page?: number;
  limit?: number;
  userId?: string;
}

const postService = {
  getPosts: async (filter?: PostFilter): Promise<Post[]> => {
    const response = await api.get<Post[]>('/posts', { params: filter });
    return response.data;
  },

  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },

  createPost: async (data: CreatePostData): Promise<Post> => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },

  updatePost: async (id: string, data: Partial<CreatePostData>): Promise<Post> => {
    const response = await api.patch<Post>(`/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  likePost: async (id: string): Promise<void> => {
    await api.post(`/posts/${id}/like`);
  },

  unlikePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}/like`);
  },

  commentOnPost: async (id: string, comment: string): Promise<void> => {
    await api.post(`/posts/${id}/comments`, { comment });
  },

  sharePost: async (id: string): Promise<void> => {
    await api.post(`/posts/${id}/share`);
  },
};

export default postService;

