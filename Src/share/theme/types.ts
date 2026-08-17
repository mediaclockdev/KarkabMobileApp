export type ThemeMode = 'light' | 'dark' | 'image'
export interface ThemeColors {
  background: string;
  text: string;
  primary: string;

  // Added Brand Colors
  button: string;
  link: string;
  error: string;
  placeholder: string;
  border: string;
  textInverse: string;
  borderInput: string;
  gray:string;
  sucess:string;

}

export interface AppTheme {
  mode: ThemeMode;
  colors: ThemeColors;
  backgroundImage?: any;
}