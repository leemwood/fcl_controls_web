export interface CategoryLang {
  locale: string
  text: string
}

export interface Category {
  id: number
  lang: CategoryLang[]
}

export interface ControllerItem {
  id: string
  lang: string
  name: string
  introduction: string
  device: number[]
  categories: number[]
}

export interface VersionDetail {
  versionCode: number
  versionName: string
}

export interface ControllerDetail {
  screenshot: number // Count of screenshots
  description: string
  author: string
  latest: VersionDetail
  history: VersionDetail[]
}

export interface Resource {
  id: string
  name: string
  type: 'file' | 'directory'
  url?: string
  size?: string
}
