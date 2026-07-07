export type TrashType = 'bottle' | 'cup' | 'ring'

export interface TrashItem {
  id: string
  type: TrashType
  x: number
  y: number
}

export interface ScenePoint {
  x: number
  y: number
}

export interface OceanMessage {
  date: string
  title: string
  summary: string
  source: string
  link?: string
}

export type MissionPhase = 'collect' | 'bottle'
