import { useEffect, useState } from 'react';

import { ThemeProvider } from 'styled-components';

import { Themes } from '@/styles/themes';

import { useAppSelector } from '@/state/appTypes';
import {
  AppColorMode,
  AppTheme,
  AppThemeSetting,
  AppThemeSystemSetting,
} from '@/state/appUiConfigs';
import { getAppColorMode, getAppThemeSetting } from '@/state/appUiConfigsSelectors';

import { assertNever } from '@/lib/assertNever';

export const AppThemeAndColorModeProvider = ({ ...props }) => {
  return <ThemeProvider theme={useAppThemeAndColorModeContext()} {...props} />;
};

export const useCurrentAppThemeSetting = () => {
  const themeSetting: AppThemeSetting = useAppSelector(getAppThemeSetting);
  const darkModePref = globalThis.matchMedia('(prefers-color-scheme: dark)');

  const [systemPreference, setSystemPreference] = useState(
    darkModePref.matches ? AppTheme.Dark : AppTheme.Light
  );

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setSystemPreference(AppTheme.Dark);
      } else {
        setSystemPreference(AppTheme.Light);
      }
    };
    darkModePref.addEventListener('change', handler);
    return () => darkModePref.removeEventListener('change', handler);
  }, []);

  const getThemeFromSetting = (): AppTheme => {
    switch (themeSetting) {
      case AppThemeSystemSetting.System:
        return systemPreference;
      case AppTheme.Classic:
      case AppTheme.Dark:
      case AppTheme.Light:
        return themeSetting;
      default:
        assertNever(themeSetting, true);
        return systemPreference;
    }
  };
  return getThemeFromSetting();
};

export const useAppThemeAndColorModeContext = () => {
  const colorMode: AppColorMode = useAppSelector(getAppColorMode);
  const theme = useCurrentAppThemeSetting();
  return Themes[theme][colorMode];
};
