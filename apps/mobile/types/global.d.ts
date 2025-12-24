/**
 * Global Type Declarations
 * Fixes React 19 + React Native type compatibility issues
 *
 * React 19 changed JSX types which breaks compatibility with @types/react-native.
 * This file provides workarounds until official types are updated.
 *
 * Key differences in React 19:
 * - ReactNode now includes bigint
 * - refs property removed from Component class
 * - JSX namespace changes
 */

import type { ComponentType, FC } from 'react';

// Fix React 19 + React Native JSX compatibility
// The main issue: React 19's ReactNode includes bigint, but @types/react@18 doesn't
declare module 'react' {
  // Extend ReactNode to include bigint (React 19 compatibility)
  type ReactNode =
    | React.ReactElement
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined
    | Iterable<React.ReactNode>;

  // Override the JSX element type checking
  namespace JSX {
    // Allow any component to be a valid JSX element type
    interface Element extends React.ReactElement<any, any> {}

    // Allow any object with a render method as JSX element class
    interface ElementClass {
      render?(): any;
      refs?: any;
    }

    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }

    // Use a permissive element type
    type ElementType = string | ComponentType<any> | ((props: any) => any);
  }

  // Add 'refs' as optional to Component to fix React 19 mismatch
  interface Component<P = {}, S = {}, SS = any> {
    refs?: { [key: string]: any };
  }
}

// Override React Native component types for React 19 compatibility
declare module 'react-native' {
  // Re-export fixed component types
  export const View: FC<any>;
  export const Text: FC<any>;
  export const ScrollView: FC<any>;
  export const Pressable: FC<any>;
  export const TextInput: FC<any>;
  export const Image: FC<any>;
  export const TouchableOpacity: FC<any>;
  export const TouchableHighlight: FC<any>;
  export const TouchableWithoutFeedback: FC<any>;
  export const KeyboardAvoidingView: FC<any>;
  export const FlatList: FC<any>;
  export const SectionList: FC<any>;
  export const ActivityIndicator: FC<any>;
  export const Modal: FC<any>;
  export const Switch: FC<any>;
  export const RefreshControl: FC<any>;
  export const SafeAreaView: FC<any>;
  export const StatusBar: FC<any>;
  export const ImageBackground: FC<any>;

  // Fix Animated namespace
  namespace Animated {
    export const View: FC<any>;
    export const Text: FC<any>;
    export const Image: FC<any>;
    export const ScrollView: FC<any>;
    export const FlatList: FC<any>;
    export function Value(value: number): any;
    export function ValueXY(value: { x: number; y: number }): any;
    export function timing(value: any, config: any): any;
    export function spring(value: any, config: any): any;
    export function sequence(animations: any[]): any;
    export function parallel(animations: any[]): any;
    export function loop(animation: any): any;
  }
}

// Fix third-party package compatibility
declare module 'expo-linear-gradient' {
  import type { FC } from 'react';
  export const LinearGradient: FC<any>;
}

declare module 'expo-image' {
  import type { FC } from 'react';
  export const Image: FC<any>;
}

declare module '@expo/vector-icons' {
  import type { FC } from 'react';
  export const Ionicons: FC<any>;
  export const MaterialIcons: FC<any>;
  export const MaterialCommunityIcons: FC<any>;
  export const FontAwesome: FC<any>;
  export const FontAwesome5: FC<any>;
  export const FontAwesome6: FC<any>;
  export const Feather: FC<any>;
  export const AntDesign: FC<any>;
  export const Entypo: FC<any>;
  export const EvilIcons: FC<any>;
  export const Octicons: FC<any>;
  export const SimpleLineIcons: FC<any>;
  export const Foundation: FC<any>;
}

declare module 'react-native-gesture-handler' {
  import type { FC } from 'react';
  export const GestureHandlerRootView: FC<any>;
  export const PanGestureHandler: FC<any>;
  export const TapGestureHandler: FC<any>;
  export const Swipeable: FC<any>;
}

declare module 'react-native-safe-area-context' {
  import type { FC } from 'react';
  export const SafeAreaProvider: FC<any>;
  export const SafeAreaView: FC<any>;
  export function useSafeAreaInsets(): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Global type utilities
declare global {
  // Timer types that work in both Node.js and browser contexts
  type TimerHandle = ReturnType<typeof setTimeout>;
  type IntervalHandle = ReturnType<typeof setInterval>;
}

export {};
