import { Redirect } from 'expo-router';

export default function MemoryIndex() {
  // Redirect to the main minder screen if someone navigates to /screens/memory directly
  return <Redirect href="/(tabs)/minder" />;
}
