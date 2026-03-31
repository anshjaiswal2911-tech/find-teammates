import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { LogOut, Mail, Badge, Calendar, MapPin, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

export function UserDetailsCard() {
  const { user, userDetails, logout } = useAuth();

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Profile Information
            </CardTitle>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage
                src={user.profileImage || userDetails?.user_metadata?.avatar_url}
                alt={user.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
              <p className="text-sm font-medium text-gray-500">
                {userDetails?.app_metadata?.provider === 'google' ? '🔵 Google Account' : 
                 userDetails?.app_metadata?.provider === 'linkedin' ? '🔵 LinkedIn Account' : 
                 '📧 Email & Password'}
              </p>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 hover:bg-white transition-colors">
              <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Email
                </p>
                <p className="text-sm font-semibold text-gray-900 break-all">{user.email}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 hover:bg-white transition-colors">
              <Badge className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  User ID
                </p>
                <p className="text-sm font-semibold text-gray-900 break-all">
                  {user.id}
                </p>
              </div>
            </div>

            {/* College */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 hover:bg-white transition-colors">
              <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  College
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.college || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Experience */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 hover:bg-white transition-colors">
              <Briefcase className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Experience
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.experience || 'Beginner'}
                </p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 hover:bg-white transition-colors">
            <Calendar className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Availability
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {user.availability || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="p-3 rounded-lg bg-white/70">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Bio
              </p>
              <p className="text-sm text-gray-700 italic">{user.bio}</p>
            </div>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="p-3 rounded-lg bg-white/70">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Skills ({user.skills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="p-3 rounded-lg bg-white/70">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Interests ({user.interests.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Last Sign In */}
          {userDetails?.last_sign_in_at && (
            <div className="p-3 rounded-lg bg-white/70">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Last Sign In
              </p>
              <p className="text-sm text-gray-700">
                {new Date(userDetails.last_sign_in_at).toLocaleString()}
              </p>
            </div>
          )}

          {/* Account Created */}
          {userDetails?.created_at && (
            <div className="p-3 rounded-lg bg-white/70">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Account Created
              </p>
              <p className="text-sm text-gray-700">
                {new Date(userDetails.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
