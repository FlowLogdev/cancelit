"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

interface SimpleAuthModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const SimpleAuthModal: React.FC<SimpleAuthModalProps> = ({ open, setOpen }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signUp, signIn } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      setOpen(false)
    } catch (error: any) {
      console.error("Authentication error:", error.message)
      alert(`Authentication failed: ${error.message}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create an account" : "Sign In"}</DialogTitle>
          <DialogDescription>
            {isSignUp ? "Create a new account to continue" : "Enter your email and password to sign in"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              type="email"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              type="password"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Button>
          <Button type="button" onClick={handleAuth}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SimpleAuthModal
