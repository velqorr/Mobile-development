import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function ButtonCustom({ title, onPress, style, textStyle }) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}