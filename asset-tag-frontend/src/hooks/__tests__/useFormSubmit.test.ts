import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFormSubmit } from '../useFormSubmit'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useFormSubmit Hook', () => {
  const mockOnSubmit = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() =>
        useFormSubmit(mockOnSubmit)
      )

      expect(result.current.isSubmitting).toBe(false)
      expect(typeof result.current.handleSubmit).toBe('function')
    })

    it('should handle successful submission', async () => {
      const successResult = { success: true, data: { id: '123' } }
      mockOnSubmit.mockResolvedValue(successResult)

      const { result } = renderHook(() =>
        useFormSubmit(mockOnSubmit, {
          onSuccess: mockOnSuccess,
        })
      )

      await act(async () => {
        const submitResult = await result.current.handleSubmit({ test: 'data' })
        expect(submitResult).toEqual({ success: true })
      })

      expect(mockOnSubmit).toHaveBeenCalledWith({ test: 'data' })
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(result.current.isSubmitting).toBe(false)
    })

    it('should handle failed submission', async () => {
      const errorResult = { success: false, error: new Error('Test error') }
      mockOnSubmit.mockResolvedValue(errorResult)

      const { result } = renderHook(() =>
        useFormSubmit(mockOnSubmit, {
          onError: mockOnError,
        })
      )

      await act(async () => {
        const submitResult = await result.current.handleSubmit({ test: 'data' })
        expect(submitResult).toEqual(errorResult)
      })

      expect(mockOnSubmit).toHaveBeenCalledWith({ test: 'data' })
      expect(mockOnError).toHaveBeenCalledWith(new Error('Test error'))
      expect(result.current.isSubmitting).toBe(false)
    })

    it('should handle thrown errors', async () => {
      const thrownError = new Error('Network error')
      mockOnSubmit.mockRejectedValue(thrownError)

      const { result } = renderHook(() =>
        useFormSubmit(mockOnSubmit, {
          onError: mockOnError,
        })
      )

      await act(async () => {
        const submitResult = await result.current.handleSubmit({ test: 'data' })
        expect(submitResult).toEqual({ success: false, error: thrownError })
      })

      expect(mockOnSubmit).toHaveBeenCalledWith({ test: 'data' })
      expect(mockOnError).toHaveBeenCalledWith(thrownError)
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe('Loading State Management', () => {
    it('should set loading state during submission', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockOnSubmit.mockReturnValue(promise)

      const { result } = renderHook(() =>
        useFormSubmit(mockOnSubmit)
      )

      act(() => {
        result.current.handleSubmit({ test: 'data' })
      })

      expect(result.current.isSubmitting).toBe(true)

      await act(async () => {
        resolvePromise!({ success: true })
        await promise
      })

      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe('Custom Messages', () => {
    it('should use custom success message', async () => {
      const { toast } = await import('sonner')
      mockOnSubmit.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useFormSubmit(mockOnSubmit, {
          successMessage: 'Custom success message',
        })
      )

      await act(async () => {
        await result.current.handleSubmit({ test: 'data' })
      })

      expect(toast.success).toHaveBeenCalledWith('Custom success message')
    })

    it('should use custom error message', async () => {
      const { toast } = await import('sonner')
      mockOnSubmit.mockResolvedValue({ success: false, error: new Error('Test error') })

      const { result } = renderHook(() =>
        useFormSubmit(mockOnSubmit, {
          errorMessage: 'Custom error message',
        })
      )

      await act(async () => {
        await result.current.handleSubmit({ test: 'data' })
      })

      expect(toast.error).toHaveBeenCalledWith('Custom error message')
    })
  })

  describe('Validation', () => {
    it('should validate data before submission', async () => {
      const { toast } = await import('sonner')
      const validate = vi.fn().mockReturnValue('Validation error')

      const { result } = renderHook(() =>
        useFormSubmit(mockOnSubmit, {
          validate,
        })
      )

      await act(async () => {
        const submitResult = await result.current.handleSubmit({ test: 'data' })
        expect(submitResult).toEqual({ success: false, error: 'Validation error' })
      })

      expect(validate).toHaveBeenCalledWith({ test: 'data' })
      expect(toast.error).toHaveBeenCalledWith('Validation error')
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should proceed with submission when validation passes', async () => {
      const validate = vi.fn().mockReturnValue(null)
      mockOnSubmit.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useFormSubmit(mockOnSubmit, {
          validate,
        })
      )

      await act(async () => {
        await result.current.handleSubmit({ test: 'data' })
      })

      expect(validate).toHaveBeenCalledWith({ test: 'data' })
      expect(mockOnSubmit).toHaveBeenCalledWith({ test: 'data' })
    })
  })
})