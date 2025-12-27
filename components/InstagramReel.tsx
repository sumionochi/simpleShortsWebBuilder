import React from 'react'
import { Heart, MessageCircle, Send, Home, Search, PlusSquare, Film, User, Camera } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function Component({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[225px] h-[400px] overflow-hidden">
      {children}
      <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
        {/* Status Bar */}
        <div className="flex justify-between items-center text-xs">
          <span>7:43 PM</span>
          <div className="flex items-center gap-1">
            <span>5%</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <rect x="20" y="10" width="2" height="4" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Camera Icon */}
        <div className="absolute top-4 right-4">
          <Camera className="w-6 h-6" />
        </div>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-serif">par</span>
        </div>

        {/* Right Side Icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white">
            <Heart className="w-6 h-6" />
          </Button>
          <span className="text-xs">2,262</span>
          <Button variant="ghost" size="icon" className="text-white">
            <MessageCircle className="w-6 h-6" />
          </Button>
          <span className="text-xs">395</span>
          <Button variant="ghost" size="icon" className="text-white">
            <Send className="w-6 h-6" />
          </Button>
          <span className="text-xs">443</span>
        </div>

        {/* User Info and Caption */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder-avatar.jpg" alt="@tensor_._boy" />
              <AvatarFallback>TB</AvatarFallback>
            </Avatar>
            <span className="font-semibold">tensor_._boy</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <Button variant="ghost" size="sm" className="ml-auto text-xs">
              Follow
            </Button>
          </div>
          <p className="text-sm">The most needed laptop guide ✨✨...</p>
          <div className="flex items-center gap-2 text-xs">
            <span>tensor_._boy • Original audio</span>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor"/>
              <path d="M19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12C17 13.1046 17.8954 14 19 14Z" fill="currentColor"/>
              <path d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14Z" fill="currentColor"/>
            </svg>
            <span>6 people</span>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-4">
          <Button variant="ghost" size="icon" className="text-white">
            <Home className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Search className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <PlusSquare className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Film className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <User className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
} 