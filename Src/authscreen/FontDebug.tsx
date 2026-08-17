import React from 'react';
import { Text, View, ScrollView, Platform } from 'react-native';

// Add this component temporarily to your app
export  const FontDebug = () => {
  // React Native exposes this on iOS via native module
  const [fonts, setFonts] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      // This logs ALL registered font families to Metro console
      const RNFont = require('react-native/Libraries/Utilities/Platform');
      console.log('Platform:', Platform.OS);
    }
  }, []);

  return (
    <ScrollView>
      {/* <Text style={{ fontFamily: 'Inter', fontWeight:'semibold', fontSize: 16,color:'#fff' }}>Test: Inter</Text>
      <Text style={{ fontFamily: 'Inter18pt-Regular', fontSize: 16,color:'#fff' }}>Test: Inter18pt-Regular</Text>
      <Text style={{ fontFamily: 'Inter18pt-Bold', fontSize: 16,color:'#fff' }}>Test: Inter18pt-Bold</Text>
      <Text style={{ fontFamily: 'Inter Bold', fontSize: 16,color:'#fff' }}>Test: Inter Bold</Text> 
      <Text style={{ fontFamily: 'Inter18pt-Medium', fontSize: 16,color:'#fff' }}>Test: Inter18pt-Medium</Text> */}
    </ScrollView>
  );
};