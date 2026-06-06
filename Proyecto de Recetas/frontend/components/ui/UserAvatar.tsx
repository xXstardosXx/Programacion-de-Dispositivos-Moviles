import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors } from '../../constants/theme';

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  size?: number;
  style?: ViewStyle;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '?',
  avatar,
  size = 80,
  style,
}) => {
  const radius = size / 2;

  if (avatar) {
    return (
      <Image
        source={{ uri: avatar }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: radius },
          style as ImageStyle | undefined,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.background,
  },
  placeholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '800',
    color: '#FFF',
  },
});
