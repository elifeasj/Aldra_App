import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, Pressable, Linking } from 'react-native';

type Props = Omit<ComponentProps<typeof Pressable>, 'onPress'> & {
  href: string;
};

export function ExternalLink({ href, children, ...rest }: Props) {
  const handlePress = async () => {
    if (Platform.OS === 'web') {
      await Linking.openURL(href);
    } else {
      await openBrowserAsync(href);
    }
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}
