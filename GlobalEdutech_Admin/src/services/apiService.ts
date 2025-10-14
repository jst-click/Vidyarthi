// API Service for Admin Panel
import * as Types from '../types';

const API_BASE_URL = 'https://server.globaledutechlearn.com';

// API Service Class
class ApiService {
  static fileUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}/${path}`;
  }
  private static getAuthHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Authentication
  static async login(username: string, password: string): Promise<Types.AuthResponse> {
    // Simple admin check for now - you can create a proper admin endpoint later
    if (username === 'globaledutechlearn@gmail.com' && (password === 'Global@2025' || password === 'Amit1234')) {
      return {
        message: 'Login successful',
        user_id: 'globaledutechlearn@gmail.com',
        token: 'admin-token-' + Date.now(),
        user: {
          _id: 'globaledutechlearn@gmail.com',
          name: 'Admin User',
          email: 'admin@vidyarthimitraa.com',
          contact_no: '',
          gender: 'other',
          education: 'Admin',
          course: 'Administration',
          provider: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  // Users Management
  static async getAllUsers(): Promise<Types.UsersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<Types.UsersResponse>(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  static async getUserById(userId: string): Promise<{ user: Types.User }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<{ user: Types.User }>(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  // User-related: downloads and test attempts
  static async getUserDownloads(userId: string): Promise<{ downloads: any[] }> {
    const response = await fetch(`${API_BASE_URL}/downloads/user/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getUserTestAttempts(userId: string): Promise<{ attempts: any[] }> {
    const response = await fetch(`${API_BASE_URL}/test-attempts/user/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateUser(userId: string, userData: Partial<Types.User>, token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(userData),
      });
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  static async deleteUser(userId: string, token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(token),
      });
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Dashboard Statistics
  static async getDashboardStats(): Promise<Types.DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<Types.DashboardStats>(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats if API fails
      return {
        total_users: 0,
        total_courses: 0,
        total_tests: 0,
        total_materials: 0,
        total_enrollments: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async getRecentActivities(): Promise<Types.RecentActivity> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/recent-activities`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<Types.RecentActivity>(response);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Return empty activities if API fails
      return {
        recent_users: [],
        recent_enrollments: [],
        recent_test_attempts: [],
      };
    }
  }

  // Courses Management
  static async getAllCourses(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  // Tests Management
  static async getAllTests(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/tests`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching tests:', error);
      throw new Error('Failed to fetch tests');
    }
  }

  static async getTestById(id: string): Promise<{ test: Types.TestItem }> {
    const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async createTest(data: Omit<Types.TestItem, '_id' | 'created_at' | 'updated_at' | 'date_published' | 'result_type' | 'answer_key' | 'tags' | 'attempts_count' | 'feedback' | 'is_active'>, token: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/tests`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async getTestQuestions(testId: string): Promise<{ questions: any[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-questions/test/${testId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching test questions:', error);
      throw new Error('Failed to fetch test questions');
    }
  }

  static async createTestWithQuestions(data: { test: any; questions: any[] }, token: string): Promise<{ message: string; test_id: string; questions_count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tests/with-questions`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating test with questions:', error);
      throw new Error('Failed to create test with questions');
    }
  }

  static async createQuestion(data: any, token: string): Promise<{ message: string; id: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-questions`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating question:', error);
      throw new Error('Failed to create question');
    }
  }

  static async updateQuestion(questionId: string, data: any, token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-questions/${questionId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error('Failed to update question');
    }
  }

  static async deleteQuestion(questionId: string, token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-questions/${questionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(token),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error('Failed to delete question');
    }
  }

  static async updateTest(id: string, data: Partial<Types.TestItem>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteTest(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Materials Management
  static async getAllMaterials(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw new Error('Failed to fetch materials');
    }
  }

  // File upload helpers
  static async uploadImage(file: File, token?: string): Promise<{ message: string; file_path: string }> {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    return this.handleResponse(response);
  }

  // ========== Notifications CRUD ==========
  static async getNotifications(): Promise<{ notifications: Types.NotificationItem[] }> {
    const response = await fetch(`${API_BASE_URL}/notifications`, { method: 'GET', headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }
  static async createNotification(data: Omit<Types.NotificationItem, '_id' | 'priority' | 'is_active' | 'read_by' | 'created_at' | 'updated_at'>, token: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications`, { method: 'POST', headers: this.getAuthHeaders(token), body: JSON.stringify(data) });
    return this.handleResponse(response);
  }
  static async updateNotification(id: string, data: Partial<Types.NotificationItem>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'PUT', headers: this.getAuthHeaders(token), body: JSON.stringify(data) });
    return this.handleResponse(response);
  }
  static async deleteNotification(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE', headers: this.getAuthHeaders(token) });
    return this.handleResponse(response);
  }

  // ========== Current Affairs CRUD ==========
  static async getCurrentAffairs(): Promise<{ current_affairs: Types.CurrentAffairsItem[] }> {
    const response = await fetch(`${API_BASE_URL}/current-affairs`, { method: 'GET', headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }
  static async createCurrentAffairs(data: Omit<Types.CurrentAffairsItem, '_id' | 'tags' | 'view_count' | 'likes' | 'is_active' | 'is_featured' | 'created_at' | 'updated_at'>, token: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/current-affairs`, { method: 'POST', headers: this.getAuthHeaders(token), body: JSON.stringify(data) });
    return this.handleResponse(response);
  }
  static async updateCurrentAffairs(id: string, data: Partial<Types.CurrentAffairsItem>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/current-affairs/${id}`, { method: 'PUT', headers: this.getAuthHeaders(token), body: JSON.stringify(data) });
    return this.handleResponse(response);
  }
  static async deleteCurrentAffairs(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/current-affairs/${id}`, { method: 'DELETE', headers: this.getAuthHeaders(token) });
    return this.handleResponse(response);
  }

  // ========== Enrollments (read-only for admin list, delete) ==========
  static async getEnrollmentsByCourse(courseId: string): Promise<{ enrollments: Types.EnrollmentItem[] }> {
    const response = await fetch(`${API_BASE_URL}/enrollments/course/${courseId}`, { method: 'GET', headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }
  static async getEnrollmentsByUser(userId: string): Promise<{ enrollments: Types.EnrollmentItem[] }> {
    const response = await fetch(`${API_BASE_URL}/enrollments/user/${userId}`, { method: 'GET', headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }
  static async deleteEnrollment(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/enrollments/${id}`, { method: 'DELETE', headers: this.getAuthHeaders(token) });
    return this.handleResponse(response);
  }

  // ========== Terms ==========
  static async getActiveTerms(): Promise<{ terms: Types.TermsItem }> {
    const response = await fetch(`${API_BASE_URL}/terms-conditions`, { method: 'GET', headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }
  static async updateTerms(id: string, data: Partial<Types.TermsItem>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/terms-conditions/${id}`, { method: 'PUT', headers: this.getAuthHeaders(token), body: JSON.stringify(data) });
    return this.handleResponse(response);
  }

  // ========== Contact ==========
  static async getContact(): Promise<{ contact: Types.ContactItem }> {
    const response = await fetch(`${API_BASE_URL}/contact`, { method: 'GET', headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }
  static async updateContact(id: string, data: Partial<Types.ContactItem>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/contact/${id}`, { method: 'PUT', headers: this.getAuthHeaders(token), body: JSON.stringify(data) });
    return this.handleResponse(response);
  }

  // ========== Contact Messages ==========
  static async getContactMessages(): Promise<{ messages: Types.ContactMessageItem[] }> {
    const response = await fetch(`${API_BASE_URL}/contact-messages`, { method: 'GET', headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }
  static async deleteContactMessage(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/contact-messages/${id}`, { method: 'DELETE', headers: this.getAuthHeaders(token) });
    return this.handleResponse(response);
  }

  // ========== Institutions CRUD ==========
  static async createInstitution(data: Omit<Types.Institution, '_id' | 'created_at' | 'updated_at'>, token: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/institutions`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        vision: data.vision,
        mission: data.mission,
      }),
    });
    return this.handleResponse(response);
  }

  static async getInstitutions(): Promise<{ institutions: Types.Institution[] }> {
    const response = await fetch(`${API_BASE_URL}/institutions`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getInstitutionById(id: string): Promise<{ institution: Types.Institution }> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateInstitution(id: string, data: Partial<Types.Institution>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteInstitution(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // ========== Testimonials CRUD (multipart for media) ==========
  static async createTestimonial(data: {
    payload: {
      title: string;
      description: string;
      student_name: string;
      course: string;
      rating?: number;
      media_type: string;
    };
    media_file: File;
    student_image?: File | null;
  }, token: string): Promise<{ message: string; id: string }> {
    const formData = new FormData();
    formData.append('media_file', data.media_file);
    if (data.student_image) formData.append('student_image', data.student_image);
    
    // Append testimonial fields directly to form data
    formData.append('title', data.payload.title);
    formData.append('description', data.payload.description);
    formData.append('student_name', data.payload.student_name);
    formData.append('course', data.payload.course);
    formData.append('rating', String(data.payload.rating || 5));
    formData.append('media_type', data.payload.media_type);

    const response = await fetch(`${API_BASE_URL}/testimonials`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    return this.handleResponse(response);
  }

  static async getTestimonials(): Promise<{ testimonials: Types.Testimonial[] }> {
    const response = await fetch(`${API_BASE_URL}/testimonials`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getTestimonialById(id: string): Promise<{ testimonial: Types.Testimonial }> {
    const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateTestimonial(id: string, data: Partial<Types.Testimonial>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteTestimonial(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // ========== Carousel ==========
  static async getCarousel(): Promise<{ items: Array<{ _id: string; image_url: string }> }> {
    const response = await fetch(`${API_BASE_URL}/carousel`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async createCarousel(image: File, token: string): Promise<{ message: string; id: string }> {
    const form = new FormData();
    form.append('image', image);
    const response = await fetch(`${API_BASE_URL}/carousel`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    return this.handleResponse(response);
  }

  static async deleteCarousel(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/carousel/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // ========== YouTube Videos ==========
  static async getYouTubeVideos(): Promise<{ videos: Array<{ _id: string; title: string; youtube_url: string; description?: string; is_active: boolean; created_at: string; updated_at: string }> }> {
    const response = await fetch(`${API_BASE_URL}/youtube`, { method: 'GET', headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }
  static async createYouTubeVideo(data: { title: string; youtube_url: string; description?: string }, token: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/youtube`, { method: 'POST', headers: this.getAuthHeaders(token), body: JSON.stringify(data) });
    return this.handleResponse(response);
  }
  static async deleteYouTubeVideo(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/youtube/${id}`, { method: 'DELETE', headers: this.getAuthHeaders(token) });
    return this.handleResponse(response);
  }

  // ========== Text Slider ==========
  static async getSliderTexts(): Promise<{ items: Array<{ _id: string; text: string; is_active: boolean; created_at: string; updated_at: string }> }> {
    const response = await fetch(`${API_BASE_URL}/text-slider`, { method: 'GET', headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }
  static async createSliderText(data: { text: string }, token: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/text-slider`, { method: 'POST', headers: this.getAuthHeaders(token), body: JSON.stringify(data) });
    return this.handleResponse(response);
  }
  static async updateSliderText(id: string, data: { text?: string; is_active?: boolean }, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/text-slider/${id}`, { method: 'PUT', headers: this.getAuthHeaders(token), body: JSON.stringify(data) });
    return this.handleResponse(response);
  }
  static async deleteSliderText(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/text-slider/${id}`, { method: 'DELETE', headers: this.getAuthHeaders(token) });
    return this.handleResponse(response);
  }

  // ========== Courses CRUD (thumbnail multipart on create) ==========
  static async createCourse(data: {
    payload: {
      name: string;
      title: string;
      description: string;
      category: string;
      sub_category: string;
      start_date: string;
      end_date: string;
      duration: string;
      instructor: string;
      price: number;
    };
    thumbnail: File;
  }, token: string): Promise<{ message: string; id: string }> {
    const formData = new FormData();
    formData.append('thumbnail', data.thumbnail);
    
    // Append course fields directly to form data
    formData.append('name', data.payload.name);
    formData.append('title', data.payload.title);
    formData.append('description', data.payload.description);
    formData.append('category', data.payload.category);
    formData.append('sub_category', data.payload.sub_category);
    formData.append('start_date', data.payload.start_date);
    formData.append('end_date', data.payload.end_date);
    formData.append('duration', data.payload.duration);
    formData.append('instructor', data.payload.instructor);
    formData.append('price', String(data.payload.price));

    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    return this.handleResponse(response);
  }

  static async getCourses(): Promise<{ courses: Types.Course[] }> {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getCourseById(id: string): Promise<{ course: Types.Course }> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateCourse(id: string, data: Partial<Types.Course>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteCourse(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // ========== Materials CRUD (pdf multipart on create) ==========
  static async createMaterial(data: {
    payload: {
      class_name: string;
      course: string;
      sub_category: string;
      module: string;
      title: string;
      description: string;
      academic_year: string;
      time_period: number;
      price: number;
    };
    pdf_file: File;
    sample_images?: File[];
  }, token: string): Promise<{ message: string; id: string }> {
    const formData = new FormData();
    formData.append('pdf_file', data.pdf_file);
    
    // Append sample images if provided
    if (data.sample_images && data.sample_images.length > 0) {
      data.sample_images.forEach((image) => {
        formData.append('sample_images', image);
      });
    }
    
    // Append material fields directly to form data
    formData.append('class_name', data.payload.class_name);
    formData.append('course', data.payload.course);
    formData.append('sub_category', data.payload.sub_category);
    formData.append('module', data.payload.module);
    formData.append('title', data.payload.title);
    formData.append('description', data.payload.description);
    formData.append('academic_year', data.payload.academic_year);
    formData.append('time_period', String(data.payload.time_period));
    formData.append('price', String(data.payload.price));

    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    return this.handleResponse(response);
  }

  static async getMaterials(): Promise<{ materials: Types.Material[] }> {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getMaterialById(id: string): Promise<{ material: Types.Material }> {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateMaterial(id: string, data: Partial<Types.Material>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteMaterial(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Health Check
  static async healthCheck(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Error checking API health:', error);
      throw new Error('API is not responding');
    }
  }
}

// Re-export types for convenience
export * from '../types';

export default ApiService;