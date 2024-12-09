'use client'

import { AssistiveBall } from "@/components/assistive-ball"
import { ChatManager } from "@/components/chat-manager"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Mic, Minimize2, Moon, PlusCircle, RotateCcw, Sun } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'

export default function SpeechToText() {
  const [isListening, setIsListening] = useState(false)
  const [text, setText] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const recognition = useRef<any>(null)
  const nodeRef = useRef(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [chatBoxPosition, setChatBoxPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition.current = new SpeechRecognition()
        recognition.current.continuous = true
        recognition.current.interimResults = true

        recognition.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map(result => result.transcript)
            .join('')
          setText(transcript)
        }
      }

      // Apply initial theme
      document.documentElement.classList.toggle('dark', isDark)
    } catch (error) {
      console.error('Error initializing speech recognition:', error)
    }
  }, [isDark])

  const startListening = useCallback(() => {
    try {
      setText('')
      setIsListening(true)
      recognition.current.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setIsListening(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    try {
      setIsListening(false)
      recognition.current.stop()
    } catch (error) {
      console.error('Error stopping speech recognition:', error)
    }
  }, [])

  const copyText = useCallback(() => {
    try {
      navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error('Error copying text:', error)
    }
  }, [text])

  const resetText = useCallback(() => {
    setText('')
    if (isListening) {
      stopListening()
    }
  }, [isListening, stopListening])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev)
  }, [])

  const toggleChatBox = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleChatBoxDrag = (e: any, data: { x: number; y: number }) => {
    // Smooth transition for chat box
    setChatBoxPosition(prev => ({
      x: prev.x + (data.x - prev.x) * 0.5, // Smooth transition
      y: prev.y + (data.y - prev.y) * 0.5  // Smooth transition
    }));
  }

  return (
    <div className={`min-h-screen w-full flex transition-colors duration-300 ease-in-out ${isDark ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <ChatManager />
      <div className="flex-1 flex items-center justify-center">
        {!isOpen && (
          <AssistiveBall onClick={toggleChatBox} isOpen={isOpen} isListening={isListening} />
        )}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            >
              <Draggable
                handle=".handle"
                nodeRef={nodeRef}
                onDrag={handleChatBoxDrag}
                position={chatBoxPosition}
              >
                <Card className="w-[440px] bg-background border-border shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl" ref={nodeRef}>
                  <div className="handle cursor-move p-3 flex items-center justify-between border-b border-border">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                        Mic Chatbox
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleChatBox}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
                        aria-label="Minimize chat"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetText}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
                        aria-label="New chat"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyText}
                        className={`text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out ${isCopied ? 'bg-green-500 text-white' : ''}`}
                        aria-label="Copy text"
                        disabled={!text}
                      >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetText}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
                        aria-label="Reset text"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
                        aria-label="Toggle theme"
                      >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {!text && !isListening && (
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Welcome to Mic Chatbox</h2>
                        <p className="text-muted-foreground">
                          Your AI-powered speech-to-text companion.
                          <br />
                          Just click the microphone to get started!
                        </p>
                      </div>
                    )}

                    <div className="min-h-[200px] max-h-[300px] relative">
                      <textarea
                        ref={textareaRef}
                        className="w-full h-full min-h-[200px] max-h-[300px] p-4 rounded-lg bg-muted text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ease-in-out scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={isListening ? 'Listening...' : 'Your text will appear here...'}
                        readOnly={isListening}
                      />
                    </div>

                    <div className="flex gap-2 justify-center">
                      <Button
                        size="lg"
                        className={`w-full transition-all duration-300 ease-in-out ${
                          isListening
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                        onClick={isListening ? stopListening : startListening}
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        {isListening ? 'Stop Recording' : 'Start Recording'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Draggable>
            </motion.div>
          )}
          {!isOpen && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 0.9, opacity: 0.5 }}
              exit={{ scale: 1, opacity: 1 }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            >
              {/* Placeholder for minimized chat box or any other content */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

