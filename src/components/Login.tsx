import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

import image1 from '@/assets/images/image8.jpeg';
import image2 from '@/assets/images/image2.jpeg';
import image3 from '@/assets/images/image3.jpeg';
import image4 from '@/assets/images/image7.jpeg';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/'); // או '/dashboard' אם זה הנתיב שלך
    } catch (error) {
      setError('שם משתמש או סיסמה לא נכונים');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Swiper Carousel */}
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="absolute inset-0 z-0"
      >
        {[image1, image2, image3, image4].map((img, i) => (
          <SwiperSlide key={i}>
            <div
              className="w-full h-screen bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Overlay for blur */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10" />

      {/* Login Card with fade-in animation */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-xl"
        >
          <Card className="w-full bg-white/90 backdrop-blur-md border border-rose-100 shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center shadow">
                <img src='/files/logo.png' alt="לוגו" className="w-20 h-20 object-contain" />
              </div>
              <CardTitle className="text-3xl font-bold text-rose-600">ברוכה הבאה להודיה</CardTitle>
              <CardDescription className="text-rose-500 mt-1">
                היכנסי למערכת ניהול סלון הכלות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">כתובת מייל</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="הכניסי את המייל שלך"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-rose-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">סיסמה</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="הכניסי את הסיסמה שלך"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10 pl-10"
                    />
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-rose-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-rose-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700"
                >
                  {isLoading ? 'מתחברת...' : 'כניסה למערכת'}
                </Button>
              </form>

              <div className="text-center">
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
                  className="text-sm text-rose-600 hover:underline"
                >
                  שכחת סיסמה?
                </button>
              </div>

              {error && (
                <div className="text-sm text-red-600 text-center border border-red-200 rounded p-2 bg-red-50">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
