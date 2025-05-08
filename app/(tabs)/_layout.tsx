import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="farmer-chat" options={{ title: 'Farmer Chat' }} />
      <Tabs.Screen name="expert-chat" options={{ title: 'Expert Chat' }} />
    </Tabs>
  );
}
