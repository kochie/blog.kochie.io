'use client'
import React, {
  ReactElement,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react'
import Highlight, { Language, defaultProps } from 'prism-react-renderer'
import themeDark from 'prism-react-renderer/themes/nightOwl'
import themeLight from 'prism-react-renderer/themes/nightOwlLight'

import styles from './codeblock.module.css'
import { THEME, useTheme } from '@/components/Theme/context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadWrapper from './loadLanguages'

export default LoadWrapper
