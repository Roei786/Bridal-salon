
import React, { useState } from 'react';
import { AlertCircle, Mail, Lock, Eye, EyeOff, Heart, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import logo from '../../public/files/logo.png'
<img src="/files/logo.png" alt="לוגו" />

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      setError('שם משתמש או סיסמה לא נכונים');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-300/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-300/20 to-rose-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-200/10 to-amber-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Elegant bridal flower patterns instead of dress silhouettes */}
        <div className="absolute top-10 left-10 opacity-20">
          <svg width="150" height="150" viewBox="0 0 150 150" className="text-rose-300 animate-float">
            <circle cx="75" cy="75" r="20" fill="currentColor" opacity="0.3" />
            <circle cx="75" cy="35" r="15" fill="currentColor" opacity="0.2" />
            <circle cx="75" cy="115" r="15" fill="currentColor" opacity="0.2" />
            <circle cx="35" cy="75" r="15" fill="currentColor" opacity="0.2" />
            <circle cx="115" cy="75" r="15" fill="currentColor" opacity="0.2" />
            <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.3" />
            <circle cx="100" cy="50" r="10" fill="currentColor" opacity="0.3" />
            <circle cx="50" cy="100" r="10" fill="currentColor" opacity="0.3" />
            <circle cx="100" cy="100" r="10" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
        
        <div className="absolute top-20 right-20 opacity-20">
          <svg width="120" height="120" viewBox="0 0 120 120" className="text-pink-300 animate-float delay-1000">
            <path d="M60,60 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0" fill="none" stroke="currentColor" strokeWidth="1"/>
            <path d="M60,30 C70,10 90,20 90,40 C90,60 70,70 60,60 C50,70 30,60 30,40 C30,20 50,10 60,30" fill="currentColor" opacity="0.3"/>
            <path d="M60,90 C70,110 90,100 90,80 C90,60 70,50 60,60 C50,50 30,60 30,80 C30,100 50,110 60,90" fill="currentColor" opacity="0.3"/>
            <path d="M30,60 C10,70 20,90 40,90 C60,90 70,70 60,60 C70,50 60,30 40,30 C20,30 10,50 30,60" fill="currentColor" opacity="0.3"/>
            <path d="M90,60 C110,70 100,90 80,90 C60,90 50,70 60,60 C50,50 60,30 80,30 C100,30 110,50 90,60" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        
        <div className="absolute bottom-20 left-20 opacity-20">
          <svg width="130" height="130" viewBox="0 0 130 130" className="text-amber-300 animate-float delay-500">
            <circle cx="65" cy="65" r="25" fill="currentColor" opacity="0.2" />
            <circle cx="65" cy="20" r="12" fill="currentColor" opacity="0.2" />
            <circle cx="65" cy="110" r="12" fill="currentColor" opacity="0.2" />
            <circle cx="20" cy="65" r="12" fill="currentColor" opacity="0.2" />
            <circle cx="110" cy="65" r="12" fill="currentColor" opacity="0.2" />
            <circle cx="35" cy="35" r="15" fill="currentColor" opacity="0.15" />
            <circle cx="95" cy="35" r="15" fill="currentColor" opacity="0.15" />
            <circle cx="35" cy="95" r="15" fill="currentColor" opacity="0.15" />
            <circle cx="95" cy="95" r="15" fill="currentColor" opacity="0.15" />
          </svg>
        </div>
        
        {/* Bridal and salon accessories */}
        <div className="absolute top-20 left-20 text-rose-200/40 animate-float">
          <Crown size={32} className="animate-pulse delay-300" />
        </div>
        <div className="absolute top-32 right-32 text-pink-200/40 animate-float-delayed">
          <Heart size={28} className="animate-pulse delay-700" />
        </div>
        <div className="absolute bottom-32 left-16 text-amber-200/40 animate-float">
          <Sparkles size={24} className="animate-pulse delay-1000" />
        </div>
        <div className="absolute bottom-20 right-20 text-rose-200/40 animate-float-delayed">
          <Crown size={36} className="animate-pulse delay-500" />
        </div>
        
        {/* Subtle Makeup Brush */}
        <div className="absolute top-1/3 right-16 opacity-25">
          <svg width="40" height="120" viewBox="0 0 40 120" className="text-rose-300 animate-float delay-800">
            <rect x="17" y="20" width="6" height="70" fill="currentColor" opacity="0.4" />
            <path d="M10,15 Q20,5 30,15 L30,25 Q20,35 10,25 Z" fill="currentColor" opacity="0.3" />
            <ellipse cx="20" cy="10" rx="15" ry="10" fill="currentColor" opacity="0.2" />
          </svg>
        </div>
        
        {/* Detailed wedding rings symbol */}
        <div className="absolute bottom-1/4 right-10 opacity-30">
          <svg width="100" height="60" viewBox="0 0 100 60" className="text-amber-400 animate-float">
            <circle cx="35" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="65" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
            <path d="M50 30 L50 15 C50 15 43 5 35 5 C27 5 20 15 20 30 C20 45 27 55 35 55 C43 55 50 45 50 45 L50 30 Z" fill="currentColor" opacity="0.3" />
            <path d="M50 30 L50 15 C50 15 57 5 65 5 C73 5 80 15 80 30 C80 45 73 55 65 55 C57 55 50 45 50 45 L50 30 Z" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
        
        {/* Decorative floral elements */}
        <div className="absolute top-1/3 right-10 opacity-20">
          <svg width="120" height="120" viewBox="0 0 120 120" className="text-pink-300 animate-float">
            <path d="M60,60 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0" fill="none" stroke="currentColor" strokeWidth="1"/>
            <path d="M60,30 C70,10 90,20 90,40 C90,60 70,70 60,60 C50,70 30,60 30,40 C30,20 50,10 60,30" fill="currentColor" opacity="0.3"/>
            <path d="M60,90 C70,110 90,100 90,80 C90,60 70,50 60,60 C50,50 30,60 30,80 C30,100 50,110 60,90" fill="currentColor" opacity="0.3"/>
            <path d="M30,60 C10,70 20,90 40,90 C60,90 70,70 60,60 C70,50 60,30 40,30 C20,30 10,50 30,60" fill="currentColor" opacity="0.3"/>
            <path d="M90,60 C110,70 100,90 80,90 C60,90 50,70 60,60 C50,50 60,30 80,30 C100,30 110,50 90,60" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        
        {/* Scattered sparkles */}
        <div className="absolute top-1/3 left-1/4 text-amber-300/30 animate-twinkle">
          <Sparkles size={16} />
        </div>
        <div className="absolute top-2/3 right-1/4 text-rose-300/30 animate-twinkle delay-500">
          <Sparkles size={20} />
        </div>
        <div className="absolute top-1/2 left-1/6 text-pink-300/30 animate-twinkle delay-1000">
          <Sparkles size={14} />
        </div>
        <div className="absolute bottom-1/4 right-1/6 text-amber-300/30 animate-twinkle delay-700">
          <Sparkles size={18} />
        </div>
        <div className="absolute top-1/5 right-1/5 text-rose-300/30 animate-twinkle delay-300">
          <Sparkles size={12} />
        </div>
        
        {/* Salon Hairdryer */}
        <div className="absolute bottom-1/5 left-1/5 opacity-20">
          <svg width="70" height="50" viewBox="0 0 70 50" className="text-rose-300 animate-float delay-600">
            <path d="M10,30 L40,30 C50,30 60,20 60,10 L10,10 Z" fill="currentColor" opacity="0.3" />
            <path d="M5,10 L10,10 L10,30 L5,30 Z" fill="currentColor" opacity="0.4" />
            <path d="M40,30 L50,40 L60,40 L60,10 C60,20 50,30 40,30" fill="currentColor" opacity="0.2" />
          </svg>
        </div>
        
        {/* Dainty Flowers */}
        <div className="absolute top-2/5 right-2/5 opacity-20">
          <svg width="80" height="80" viewBox="0 0 80 80" className="text-pink-300 animate-float delay-400">
            <path d="M40,35 C45,25 55,30 55,40 C55,50 45,55 40,45 C35,55 25,50 25,40 C25,30 35,25 40,35" fill="currentColor" opacity="0.3" />
            <circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.5" />
            <path d="M40,20 C42,15 48,17 48,22 C48,27 42,29 40,24 C38,29 32,27 32,22 C32,17 38,15 40,20" fill="currentColor" opacity="0.3" />
            <path d="M40,60 C42,55 48,57 48,62 C48,67 42,69 40,64 C38,69 32,67 32,62 C32,57 38,55 40,60" fill="currentColor" opacity="0.3" />
            <path d="M20,40 C15,42 17,48 22,48 C27,48 29,42 24,40 C29,38 27,32 22,32 C17,32 15,38 20,40" fill="currentColor" opacity="0.3" />
            <path d="M60,40 C55,42 57,48 62,48 C67,48 69,42 64,40 C69,38 67,32 62,32 C57,32 55,38 60,40" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
        
        {/* Hearts floating up animation */}
        <div className="absolute top-1/4 right-1/3 text-rose-300/20 animate-float-up">
          <Heart size={18} fill="currentColor" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 text-pink-300/20 animate-float-up delay-700">
          <Heart size={22} fill="currentColor" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-amber-300/20 animate-float-up delay-1500">
          <Heart size={16} fill="currentColor" />
        </div>
        <div className="absolute top-1/3 left-1/4 text-rose-300/20 animate-float-up delay-2300">
          <Heart size={20} fill="currentColor" />
        </div>
        
        {/* Elegant Flower Pattern */}
        <div className="absolute top-10 left-1/3 opacity-15">
          <svg width="120" height="120" viewBox="0 0 120 120" className="text-white animate-float delay-1200">
            {/* Elegant flower design */}
            <path d="M60,30 C70,10 90,20 90,40 C90,60 70,70 60,60 C50,70 30,60 30,40 C30,20 50,10 60,30" fill="currentColor" opacity="0.15"/>
            <path d="M60,90 C70,110 90,100 90,80 C90,60 70,50 60,60 C50,50 30,60 30,80 C30,100 50,110 60,90" fill="currentColor" opacity="0.15"/>
            <path d="M30,60 C10,70 20,90 40,90 C60,90 70,70 60,60 C70,50 60,30 40,30 C20,30 10,50 30,60" fill="currentColor" opacity="0.15"/>
            <path d="M90,60 C110,70 100,90 80,90 C60,90 50,70 60,60 C50,50 60,30 80,30 C100,30 110,50 90,60" fill="currentColor" opacity="0.15"/>
            <circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.2" />
          </svg>
        </div>
        
        {/* Salon Scissors Element */}
        <div className="absolute top-1/6 right-1/6 opacity-20">
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-pink-300 animate-float delay-800">
            <path d="M15,15 L45,45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M15,45 L45,15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="15" cy="15" r="5" fill="currentColor" opacity="0.5" />
            <circle cx="45" cy="15" r="5" fill="currentColor" opacity="0.5" />
            <path d="M10,15 Q5,15 5,10 Q5,5 10,5 Q15,5 15,10 Q15,15 10,15" fill="currentColor" opacity="0.3" />
            <path d="M50,15 Q45,15 45,10 Q45,5 50,5 Q55,5 55,10 Q55,15 50,15" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border border-pink-100 backdrop-blur-sm bg-white/95 animate-fade-in relative z-10 overflow-hidden">
        {/* Decorative Card Corner Elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-100/40 to-transparent rounded-bl-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-100/40 to-transparent rounded-tr-[100px]"></div>
        
        {/* Decorative floral corners */}
        <div className="absolute top-3 right-3 opacity-50">
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-rose-300">
            <path d="M0,0 C10,5 20,15 20,30 C20,15 30,5 40,0 C30,5 20,15 5,20 C20,20 30,30 35,40 C30,30 20,20 0,0" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-3 left-3 opacity-50 rotate-180">
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-rose-300">
            <path d="M0,0 C10,5 20,15 20,30 C20,15 30,5 40,0 C30,5 20,15 5,20 C20,20 30,30 35,40 C30,30 20,20 0,0" fill="currentColor" />
          </svg>
        </div>
        
        <CardHeader className="text-center pb-8 relative">
          <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
            <img src="/files/logo.png" alt="הודיה לוגו" className="w-20 h-20 object-contain" />

            <div className="absolute -top-2 -right-2 text-rose-400 animate-twinkle">
              <Sparkles size={16} />
            </div>
            
            {/* Decorative circle around logo */}
            <div className="absolute inset-0 border-2 border-pink-200/50 rounded-full"></div>
            <div className="absolute -inset-2 border border-pink-100/30 rounded-full"></div>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
            ברוכה הבאה להודיה
          </CardTitle>
          <CardDescription className="text-rose-700 text-lg flex items-center justify-center gap-2">
            <Crown size={18} className="text-rose-500" />
            היכנסי למערכת ניהול סלון הכלות
            <Crown size={18} className="text-rose-500" />
          </CardDescription>
          
          {/* Decorative divider with heart */}
          <div className="relative flex py-4 items-center w-4/5 mx-auto">
            <div className="flex-grow border-t border-pink-200"></div>
            <div className="flex-shrink mx-3 text-pink-400">
              <Heart size={14} fill="currentColor" />
            </div>
            <div className="flex-grow border-t border-pink-200"></div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-scale-in border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-rose-400" />
                כתובת מייל
              </Label>
              <div className="relative group">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-rose-500 group-hover:text-rose-600 transition-colors duration-200" />
                <Input
                  id="email"
                  type="email"
                  placeholder="הכניסי את המייל שלך"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-right pr-12 pl-4 h-12 border-rose-200 focus:border-rose-400 focus:ring-rose-200 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white/95 rounded-lg"
                />
                {/* Decorative input highlight effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-300/20 via-pink-400/20 to-rose-300/20 rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-rose-400" />
                סיסמה
              </Label>
              <div className="relative group">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-rose-500 group-hover:text-rose-600 transition-colors duration-200" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="הכניסי את הסיסמה שלך"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-right pr-12 pl-12 h-12 border-rose-200 focus:border-rose-400 focus:ring-rose-200 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white/95 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-rose-500 hover:text-rose-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {/* Decorative input highlight effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-300/20 via-pink-400/20 to-rose-300/20 rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-lg relative overflow-hidden" 
              disabled={isLoading}
            >
              {/* Decorative sparkle effects on button */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 rounded-full blur-md"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-white/20 rounded-full blur-md"></div>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  מתחברת...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Sparkles size={16} className="text-white/80" />
                  כניסה למערכת
                  <Sparkles size={16} className="text-white/80" />
                </div>
              )}
            </Button>
          </form>
          
          <div className="text-center mt-6 relative">
            {/* Decorative divider */}
            <div className="relative flex py-2 items-center w-4/5 mx-auto mb-2">
              <div className="flex-grow border-t border-pink-200"></div>
              <div className="flex-shrink mx-3 text-pink-300">
                <Heart size={12} fill="currentColor" />
              </div>
              <div className="flex-grow border-t border-pink-200"></div>
            </div>
            
            <button 
              type="button" 
              onClick={async () => {
                if (!email) {
                  setError('אנא הכניסי את כתובת המייל שלך כדי לאפס את הסיסמה');
                  return;
                }
                
                try {
                  setIsLoading(true);
                  await resetPassword(email);
                  setError('');
                  alert('הוראות לאיפוס סיסמה נשלחו למייל שלך');
                } catch (error) {
                  setError('לא ניתן לשלוח מייל לאיפוס סיסמה. אנא בדקי את כתובת המייל');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="text-rose-600 hover:text-rose-800 underline underline-offset-4 hover:no-underline transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">שכחת סיסמה?</span>
              {/* Decorative underline effect */}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-400/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
