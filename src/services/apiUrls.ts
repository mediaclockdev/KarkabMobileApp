import i18n from "../localization/i18n";
import { AppLanguage } from "../localization/supportLang";

export const BASE_URL = 'https://karkab.mediaclocksoft.com.au';
const getLanguage = () => {
  const activeCode = i18n.language.split('-')[0] as AppLanguage;
  console.log(activeCode, "kkkk")
  return activeCode === 'en' ? 'english' : 'arabic';
};
const apiUrls = {
  homeApi: 'https://randomuser.me/api/?results=10',
  profileApi: '/api/profile',
  signup: 'api/auth/signup',
  login: '/api/auth/login',
  forgetpassword: '/api/auth/forgot-password',
  categorie: `/api/categories?language=${getLanguage()}`,
  categories: `/api/categories/parents?language=${getLanguage()}`,
  uploadSong: `/api/songs?language=${getLanguage()}`,
  resetPassword: `/api/auth/reset-password?language=${getLanguage()}`,
  Googlelogin: `/api/auth/google?language=${getLanguage()}`,
  Applelogin: `/api/auth/apple`,
  favorites: `/api/favorites?language=${getLanguage()}`,
  dashboard: `api/admin/dashboard-stats`,
  allsongs: `/api/songs/all?language=${getLanguage()}`,
  singlesongdetail: (id: number | string) => `/api/songs/${id}?language=${getLanguage()}`,
  singlerecdetail: (id: number | string) => `/api/recordings/${id}?language=${getLanguage()}`,
  randomsong: `/api/songs/random?language=${getLanguage()}`,
  getsonglist: `/api/songs?language=${getLanguage()}`,
  topmost: `/api/songs/most-sung?sort=most-sung&limit=50?language=${getLanguage()}`,
  likesong: (id: number | string) => `/api/songs/${id}/like?language=${getLanguage()}`,
  dislikesong: (id: number | string) => `/api/songs/${id}/dislike?language=${getLanguage()}`,
  uploadrecording: `/api/recordings?language=${getLanguage()}`,
  getrecording: `/api/recordings?language=${getLanguage()}`,
  getrecordingpublic: `/api/recordings/public?language=${getLanguage()}`,
  getpopularsong: `/api/songs/popular?language=${getLanguage()}`,
  gettrandingsong: `/api/songs/trending?language=${getLanguage()}`,
  otpverify: `/api/auth/verify-otp?language=${getLanguage()}`,
  addfavorite: (id: number | string) => `/api/songs/${id}/favorite?language=${getLanguage()}`,
  getsongcategorieslist: (id: number | string) => `/api/categories/${id}/songs?language=${getLanguage()}`,
  getnewreleases: `/api/songs/new-releases?language=${getLanguage()}`,
  getsudanesesong: `/api/songs/sudanese-classics?language=${getLanguage()}`,
  sudanesecategory: `/api/categories/sudanese-cultural/subcategories?language=${getLanguage()}`,
  getsudanesesongbycategory: (categoryId: number | string) => `/api/categories/${categoryId}/songs?language=${getLanguage()}`,
  artists: `/api/artists/active?language=${getLanguage()}`,
  selectartists: `/api/user/artists?language=${getLanguage()}`,
  artistmixsong: `/api/songs/artist-mix?language=${getLanguage()}`,
  recommendedsongs: `/api/songs/for-you?language=${getLanguage()}`,
  artistSongs: (id: number | string) => `/api/artists/${id}/songs?language=${getLanguage()}`,
  artistlatestsong: `/api/songs/latest?language=${getLanguage()}`,
  artistsong: `/api/songs?language=${getLanguage()}`,
  adjacentsong: (id: number | string) => `/api/songs/${id}/adjacent?language=${getLanguage()}`,
  createplaylist: `/api/playlists?language=${getLanguage()}`,
  deleteplaylist: (id: number | string) => `/api/playlists/${id}?language=${getLanguage()}`,
  playlistDetail: (id: string | number) => `/api/playlists/${id}?language=${getLanguage()}`,
  addSongToPlaylist: (id: string | number) => `/api/playlists/${id}/songs?language=${getLanguage()}`,
  gettags: `/api/tags?language=${getLanguage()}`,
  gettagSongs: (id: string | number) => `/api/songs/by-tag/${id}?language=${getLanguage()}`,
  getsudanseclassicsongs: `/api/songs/Sudanese-classics?language=${getLanguage()}`,
  getplaylists: `/api/app/playlists?language=${getLanguage()}`,
  getplaylistsongs: (playlistId: string | number) => `/api/app/playlists/${playlistId}?language=${getLanguage()}`,
  deletesongplaylist: (playlistId: string | number, id: string | number) => `/api/playlists/${playlistId}/songs/${id}?language=${getLanguage()}`,
  downloadsongs: (id: string | number) => `/api/songs/${id}/download?language=${getLanguage()}`,
  requestPublicRecording: (id: string | number) => `/api/recordings/${id}/request-public?language=${getLanguage()}`,
  playlistreorder: (id: string | number) => `/api/playlists/${id}/reorder?language=${getLanguage()}`,
};

export default apiUrls;
