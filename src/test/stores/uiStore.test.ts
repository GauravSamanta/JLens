import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUIStore } from '../../stores/uiStore'
import { act } from '@testing-library/react'

describe('uiStore', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    act(() => {
      useUIStore.setState({
        mode: 'explore',
        theme: 'dark',
        diffViewStyle: 'side-by-side',
      })
    })
  })

  describe('mode', () => {
    it('defaults to explore', () => {
      expect(useUIStore.getState().mode).toBe('explore')
    })

    it('switches to diff mode', () => {
      act(() => useUIStore.getState().setMode('diff'))
      expect(useUIStore.getState().mode).toBe('diff')
    })

    it('switches to query mode', () => {
      act(() => useUIStore.getState().setMode('query'))
      expect(useUIStore.getState().mode).toBe('query')
    })

    it('switches back to explore', () => {
      act(() => useUIStore.getState().setMode('diff'))
      act(() => useUIStore.getState().setMode('explore'))
      expect(useUIStore.getState().mode).toBe('explore')
    })
  })

  describe('theme', () => {
    it('sets theme to light', () => {
      act(() => useUIStore.getState().setTheme('light'))
      expect(useUIStore.getState().theme).toBe('light')
    })

    it('sets theme to dark', () => {
      act(() => useUIStore.getState().setTheme('light'))
      act(() => useUIStore.getState().setTheme('dark'))
      expect(useUIStore.getState().theme).toBe('dark')
    })

    it('toggleTheme switches from dark to light', () => {
      act(() => useUIStore.getState().toggleTheme())
      expect(useUIStore.getState().theme).toBe('light')
    })

    it('toggleTheme switches from light to dark', () => {
      act(() => useUIStore.getState().setTheme('light'))
      act(() => useUIStore.getState().toggleTheme())
      expect(useUIStore.getState().theme).toBe('dark')
    })

    it('persists theme to localStorage', () => {
      act(() => useUIStore.getState().setTheme('light'))
      expect(localStorage.setItem).toHaveBeenCalledWith('jlens-theme', 'light')
    })

    it('toggleTheme persists to localStorage', () => {
      act(() => useUIStore.getState().toggleTheme())
      expect(localStorage.setItem).toHaveBeenCalledWith('jlens-theme', 'light')
    })
  })

  describe('rawViewFormat', () => {
    it('defaults to pretty', () => {
      expect(useUIStore.getState().rawViewFormat).toBe('pretty')
    })

    it('toggles between pretty and minified', () => {
      act(() => useUIStore.getState().toggleRawViewFormat())
      expect(useUIStore.getState().rawViewFormat).toBe('minified')

      act(() => useUIStore.getState().toggleRawViewFormat())
      expect(useUIStore.getState().rawViewFormat).toBe('pretty')
    })
  })

  describe('diffViewStyle', () => {
    it('defaults to side-by-side', () => {
      expect(useUIStore.getState().diffViewStyle).toBe('side-by-side')
    })

    it('switches to inline', () => {
      act(() => useUIStore.getState().setDiffViewStyle('inline'))
      expect(useUIStore.getState().diffViewStyle).toBe('inline')
    })

    it('switches back to side-by-side', () => {
      act(() => useUIStore.getState().setDiffViewStyle('inline'))
      act(() => useUIStore.getState().setDiffViewStyle('side-by-side'))
      expect(useUIStore.getState().diffViewStyle).toBe('side-by-side')
    })
  })

  describe('editorHeight', () => {
    it('defaults to 250', () => {
      expect(useUIStore.getState().editorHeight).toBe(250)
    })

    it('updates editor height', () => {
      act(() => useUIStore.getState().setEditorHeight(400))
      expect(useUIStore.getState().editorHeight).toBe(400)
    })
  })

  describe('editorCollapsed', () => {
    it('defaults to false', () => {
      expect(useUIStore.getState().editorCollapsed).toBe(false)
    })

    it('sets editor collapsed state', () => {
      act(() => useUIStore.getState().setEditorCollapsed(true))
      expect(useUIStore.getState().editorCollapsed).toBe(true)

      act(() => useUIStore.getState().setEditorCollapsed(false))
      expect(useUIStore.getState().editorCollapsed).toBe(false)
    })
  })
})
