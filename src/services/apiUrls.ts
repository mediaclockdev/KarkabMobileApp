export const BASE_URL = 'https://karkab.mediaclocksoft.com.au';

const apiUrls = {
  homeApi: 'https://randomuser.me/api/?results=10',
  profileApi: '/api/profile',
  signup: 'api/auth/signup',
  login: '/api/auth/login',
  forgetpassword: '/api/auth/forgot-password',
  categories: '/api/categories/parents',
  uploadSong: '/api/songs',
  resetPassword: '/api/auth/reset-password',
  Googlelogin: '/api/auth/google',
  Applelogin: '/api/auth/apple',
  favorites: '/api/favorites',
  dashboard: 'api/admin/dashboard-stats',
  singlesongdetail: (id: number | string) => `/api/songs/${id}`,
  getsonglist: '/api/songs',
  topmost: '/api/songs/most-sung?sort=most-sung&limit=50',
  likesong: (id: number | string) => `/api/songs/${id}/like`,
  dislikesong: (id: number | string) => `/api/songs/${id}/dislike`,
  uploadrecording: '/api/recordings',
  getrecording: '/api/recordings',
  getpopularsong: '/api/songs/popular',
  gettrandingsong: '/api/songs/trending',
  otpverify: '/api/auth/verify-otp',
  addfavorite: (id: number | string) => `/api/songs/${id}/favorite`,
  getsongcategorieslist: (id: number | string) => `/api/categories/${id}/songs`,
  getnewreleases: '/api/songs/new-releases',
  getsudanesesong: '/api/songs/sudanese-classics',
  sudanesecategory: '/api/categories/sudanese-cultural/subcategories',
  getsudanesesongbycategory: (categoryId: number | string) => `/api/categories/${categoryId}/songs`,
  artists: '/api/artists/active',
  selectartists: '/api/user/artists'


};

export default apiUrls;
