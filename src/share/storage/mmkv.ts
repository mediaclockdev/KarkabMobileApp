import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV({
  id: 'app-storage',  encryptionKey: 'your-secret-key',
});