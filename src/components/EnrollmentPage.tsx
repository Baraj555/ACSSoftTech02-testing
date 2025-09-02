import React, { useState } from 'react';
import { User, Mail, Phone, BookOpen, CheckCircle, ArrowLeft, Clock, IndianRupee, Users, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageType } from '../App';

interface EnrollmentPageProps {
  onNavigate: (page: PageType) => void;
}

const EnrollmentPage: React.FC<EnrollmentPageProps> = ({ onNavigate }) => {
  const { courses, addEnrollment } = useApp();
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: 'beginner',
    goals: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setIsSubmitting(true);
    
    try {
      const course = courses.find(c => c.id === selectedCourse);
      if (!course) throw new Error('Course not found');

      await addEnrollment({
        courseId: selectedCourse,
        courseName: course.name,
        studentName: formData.name,
        studentEmail: formData.email,
        studentPhone: formData.phone,
        enrollmentDate: new Date().toISOString(),
        status: 'enrolled',
        price: course.price,
        progress: 0,
        notes: '',
        experience: formData.experience,
        goals: formData.goals
      });
      
      setStep(3); // Success step
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Enrollment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Course Enrollment</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
          {[1, 2].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepNumber
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > stepNumber ? <CheckCircle className="h-5 w-5" /> : stepNumber}
              </div>
              {stepNumber < 2 && (
                <div
                  className={`w-12 h-1 ml-4 ${
                    step > stepNumber ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Course Selection */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Course</h2>
            <p className="text-gray-600">Select the training program that matches your career goals</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`cursor-pointer border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                  selectedCourse === course.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
                  <div className="text-right">
                    <div className="flex items-center text-2xl font-bold text-green-600">
                      <IndianRupee className="h-6 w-6 mr-1" />
                      {course.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">{course.duration} weeks</div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{course.duration} weeks</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{course.enrolledStudents}/{course.maxStudents}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Starts {new Date(course.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Course Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.features.slice(0, 4).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedCourse === course.id && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-blue-800 font-medium text-center">Selected Course</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedCourse}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              Continue to Registration
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Student Information */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Information</h2>
            <p className="text-gray-600">Please provide your details to complete enrollment</p>
          </div>

          {/* Selected Course Summary */}
          {selectedCourseData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Selected Course:</h4>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">{selectedCourseData.name}</div>
                  <div className="text-gray-600">{selectedCourseData.duration} weeks • {selectedCourseData.level}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-2xl font-bold text-green-600">
                    <IndianRupee className="h-6 w-6 mr-1" />
                    {selectedCourseData.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Experience
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Complete Beginner</option>
                <option value="some">Some Programming Knowledge</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Career Goals (Optional)
              </label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about your career goals and what you hope to achieve..."
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Back to Courses
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Enrolling...</span>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Complete Enrollment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enrollment Successful!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Welcome to ACS Soft Tech! We've received your enrollment for {selectedCourseData?.name}.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">What's Next?</h4>
            <div className="space-y-3 text-left">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>You'll receive a confirmation email within 24 hours</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Our team will contact you to discuss payment options</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Course materials will be provided before the start date</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Access to student portal and learning resources</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              View My Courses
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentPage;