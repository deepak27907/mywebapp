import React, { useState } from 'react';
import { Eye, EyeOff, BookOpen, Target, GraduationCap, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';

const Login: React.FC = () => {
  const { signIn, signUp, loading } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    studentId: '',
    institute: '',
    targetExam: '' as 'NEET' | 'JEE' | '',
    currentStatus: '' as 'Class 11' | 'Class 12' | 'Dropper' | '',
    targetYear: '',
    coachingInstitute: '',
    preferredSubjects: [] as string[]
  });

  const subjects = {
    NEET: ['Physics', 'Chemistry', 'Biology', 'English', 'Hindi'],
    JEE: ['Physics', 'Chemistry', 'Mathematics', 'English']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await signIn(formData.email, formData.password);
    } else {
      // Create user object for registration
      const userData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        institute: formData.institute,
        targetExam: formData.targetExam as 'NEET' | 'JEE',
        currentStatus: formData.currentStatus as 'Class 11' | 'Class 12' | 'Dropper',
        targetYear: formData.targetYear,
        coachingInstitute: formData.coachingInstitute,
        preferredSubjects: formData.preferredSubjects
      };
      
      await signUp(formData.email, formData.password, userData);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects.includes(subject)
        ? prev.preferredSubjects.filter(s => s !== subject)
        : [...prev.preferredSubjects, subject]
    }));
  };

  const isFormValid = () => {
    if (isLogin) {
      return formData.email && formData.password;
    } else {
      return formData.email && formData.password && formData.name && 
             formData.targetExam && formData.currentStatus;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">InsideMentor</h1>
          </div>
          <p className="text-gray-600">
            {isLogin ? 'Welcome back!' : 'Join your academic wellness journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your school/college ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School/College Name
                </label>
                <input
                  type="text"
                  value={formData.institute}
                  onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your school or college name"
                />
              </div>

              {/* Target Exam Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Target Exam *
                </label>
                <select
                  value={formData.targetExam}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    targetExam: e.target.value as 'NEET' | 'JEE' | '',
                    preferredSubjects: [] // Reset subjects when exam changes
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select your target exam</option>
                  <option value="NEET">NEET (Medical)</option>
                  <option value="JEE">JEE (Engineering)</option>
                </select>
              </div>

              {/* Current Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Current Status *
                </label>
                <select
                  value={formData.currentStatus}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    currentStatus: e.target.value as 'Class 11' | 'Class 12' | 'Dropper' | ''
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select your current status</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="Dropper">Dropper</option>
                </select>
              </div>

              {/* Target Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Target Year
                </label>
                <select
                  value={formData.targetYear}
                  onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select target year</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              {/* Coaching Institute */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coaching Institute (Optional)
                </label>
                <input
                  type="text"
                  value={formData.coachingInstitute}
                  onChange={(e) => setFormData({ ...formData, coachingInstitute: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your coaching institute name"
                />
              </div>

              {/* Preferred Subjects */}
              {formData.targetExam && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Subjects (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {subjects[formData.targetExam as keyof typeof subjects]?.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectToggle(subject)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          formData.preferredSubjects.includes(subject)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({
                email: '',
                password: '',
                name: '',
                studentId: '',
                institute: '',
                targetExam: '',
                currentStatus: '',
                targetYear: '',
                coachingInstitute: '',
                preferredSubjects: []
              });
            }}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;