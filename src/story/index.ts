import type { Chapter } from '../levels/types'
import { prologue } from './prologue'
import { ch1 } from './ch1'
import { ch2 } from './ch2'
import { ch3 } from './ch3'
import { ch4 } from './ch4'
import { ch5 } from './ch5'
import { finale } from './finale'

export const CHAPTERS: Chapter[] = [prologue, ch1, ch2, ch3, ch4, ch5, finale]
