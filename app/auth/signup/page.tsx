"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Image as ImageIcon, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAvatarFile(file)
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    } else {
      setAvatarPreview("")
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    let newErrors: { password?: string; confirmPassword?: string } = {}
    if (!fullName) {
      setError("Full name is required.")
      setLoading(false)
      return
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters."
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match."
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      setLoading(false)
      return
    }
    let avatarUrl = null
    if (avatarFile) {
      // Upload avatar first to get public URL
      const tempId = crypto.randomUUID()
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${tempId}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
        avatarUrl = publicUrlData?.publicUrl || null
      }
    }
    // Pass full_name and avatar_url as user metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, avatar_url: avatarUrl }
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess("Check your email to confirm your account.")
    setLoading(false)
    setTimeout(() => router.push("/auth/signin"), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
            <img src="/Ecom-logo-title.svg" />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-bold text-gray-500 hover:text-gray-800 transition duration-300">
              Sign in here
            </Link>
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Enter your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full"
                />
                {avatarPreview && (
                  <img src={avatarPreview} alt="Avatar preview" className="mt-2 w-16 h-16 rounded-full object-cover border" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                    className={errors.password ? "w-full pr-10 border-red-500" : "w-full pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter your password"
                    className={errors.confirmPassword ? "w-full pr-10 border-red-500" : "w-full pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-700 text-white font-semibold transition-all duration-300"
              >
                {loading ? "Signing up..." : "Sign up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 