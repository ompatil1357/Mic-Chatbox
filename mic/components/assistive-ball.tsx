'use client'

import { Mic } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'

interface AssistiveBallProps {
  onClick: () => void
  isOpen: boolean
  isListening: boolean
}

export function AssistiveBall({ onClick, isOpen, isListening }: AssistiveBallProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const nodeRef = useRef(null)

  useEffect(() => {
    try {
      const savedPosition = localStorage.getItem('assistiveBallPosition')
      if (savedPosition) {
        setPosition(JSON.parse(savedPosition))
      }
    } catch (error) {
      console.error('Error loading saved position:', error)
      setPosition({ x: 20, y: 20 })
    }
  }, [])

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    try {
      setPosition({ x: data.x, y: data.y })
      localStorage.setItem('assistiveBallPosition', JSON.stringify({ x: data.x, y: data.y }))
    } catch (error) {
      console.error('Error saving position:', error)
    }
  }

  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      bounds="parent"
      nodeRef={nodeRef}
    >
      <button
        ref={nodeRef}
        onClick={onClick}
        className={`fixed z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out ${
          isOpen
            ? 'bg-primary/20 hover:bg-primary/30'
            : 'bg-primary hover:bg-primary/90'
        } ${isListening ? 'animate-pulse' : ''} shadow-lg hover:shadow-xl`}
        aria-label="Toggle chat box"
      >
        {!isOpen && (
          <Mic className={`w-6 h-6 text-primary-foreground`} />
        )}
      </button>
    </Draggable>
  )
}

