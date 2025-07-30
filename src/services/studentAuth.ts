import { User } from '../types';

// Mock institute data - in real implementation, this would come from your institute's API
const mockInstituteData = [
  {
    studentId: 'STU001',
    name: 'John Doe',
    dateOfBirth: '2000-05-15',
    institute: 'Tech University',
    department: 'Computer Science',
    year: '3rd Year'
  },
  {
    studentId: 'STU002',
    name: 'Jane Smith',
    dateOfBirth: '1999-08-22',
    institute: 'Tech University',
    department: 'Engineering',
    year: '4th Year'
  },
  {
    studentId: 'STU003',
    name: 'Mike Johnson',
    dateOfBirth: '2001-03-10',
    institute: 'Tech University',
    department: 'Mathematics',
    year: '2nd Year'
  }
];

export interface StudentAuthData {
  studentId: string;
  name: string;
  dateOfBirth: string;
  institute: string;
  department: string;
  year: string;
}

class StudentAuthService {
  // Simulate fetching student data from institute
  async getStudentData(studentId: string, dateOfBirth: string): Promise<StudentAuthData | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find student in mock data
    const student = mockInstituteData.find(
      s => s.studentId === studentId && s.dateOfBirth === dateOfBirth
    );
    
    return student || null;
  }

  // Validate student credentials
  async validateStudent(studentId: string, dateOfBirth: string): Promise<User | null> {
    try {
      const studentData = await this.getStudentData(studentId, dateOfBirth);
      
      if (!studentData) {
        throw new Error('Invalid student ID or date of birth');
      }

      // Create user object from institute data
      const user: User = {
        id: studentId, // Use student ID as user ID
        name: studentData.name,
        studentId: studentData.studentId,
        dateOfBirth: studentData.dateOfBirth,
        institute: studentData.institute,
        department: studentData.department,
        year: studentData.year
      };

      return user;
    } catch (error) {
      console.error('Student validation error:', error);
      return null;
    }
  }

  // Register new student (for demo purposes)
  async registerStudent(studentData: Omit<User, 'id'>): Promise<User> {
    // In real implementation, this would send data to institute
    const user: User = {
      id: studentData.studentId,
      name: studentData.name,
      studentId: studentData.studentId,
      dateOfBirth: studentData.dateOfBirth,
      institute: studentData.institute || 'Default Institute',
      department: studentData.department || 'General',
      year: studentData.year || '1st Year'
    };

    return user;
  }

  // Get available institutes (for demo)
  getAvailableInstitutes(): string[] {
    return [
      'Tech University',
      'Science College',
      'Engineering Institute',
      'Medical University',
      'Arts College'
    ];
  }

  // Get available departments (for demo)
  getAvailableDepartments(): string[] {
    return [
      'Computer Science',
      'Engineering',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Economics',
      'Psychology',
      'Literature',
      'History'
    ];
  }
}

export const studentAuthService = new StudentAuthService(); 