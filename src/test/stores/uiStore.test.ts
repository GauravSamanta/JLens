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
})
