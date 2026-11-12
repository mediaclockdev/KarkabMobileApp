// navigation/AuthStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../authscreen/Login";
import SignUp from "../authscreen/SignUp";
import ForgotPassword from "../authscreen/ForgotPassword";
import OtpVerification from "../authscreen/OtpVerification";
import ResetPassword from "../authscreen/ResetPassword";
import Recording from "../screens/Recording";
import { HideableBottomTabs } from "./HideableBottomTabs";
import { Tabs } from "./Tabs";
import Privacy from "../authscreen/Privacy";
import Terms from "../authscreen/Terms";


const Stack = createNativeStackNavigator();

export default function StackTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="OtpVerification" component={OtpVerification} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="Privacy" component={Privacy} />
      <Stack.Screen name="Terms" component={Terms} />

      {/* <Stack.Screen
  name="Tabs"
  component={Tabs}
/>
  <Stack.Screen name="Recording" component={Recording} /> */}
    </Stack.Navigator>
  );
}

