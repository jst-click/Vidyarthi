import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type TestItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const TestPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterSubCourse, setFilterSubCourse] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [questionsOpen, setQuestionsOpen] = useState<boolean>(false);
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);
  const [editing, setEditing] = useState<TestItem | null>(null);
  const [questionFormOpen, setQuestionFormOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);
  const [questionPayload, setQuestionPayload] = useState({
    question: '',
    options: [
      { label: 'A', text: '' },
      { label: 'B', text: '' },
      { label: 'C', text: '' },
      { label: 'D', text: '' },
      { label: 'E', text: '' }
    ],
    correct_answer: '',
    explanation: '',
    marks: 1
  });
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [descriptionImages, setDescriptionImages] = useState<File[]>([]);

  // Filter options
  const difficultyLevels = ['Easy', 'Medium', 'Hard'];
  
  // Hierarchical course structure
  const courseCategories = {
    'PUC': ['I PUC', 'II PUC'],
    'UG Courses': ['B.Com', 'BBA', 'BCA', 'B.Sc'],
    'PG Courses': ['M.Com', 'MBA', 'MCA', 'MFA', 'MTA', 'M.Ed'],
    'UGC Exams': ['NET', 'KSET', 'NEET', 'JEE'],
    'Professional Courses': ['CA (Chartered Accountant)', 'CS (Company Secretary)', 'CMA (Cost & Management Accountant)', 'ACCA (Association of Chartered Certified Accountants)'],
    'Competitive Exams': ['KPSC (Karnataka Public Service Commission)', 'UPSC (Union Public Service Commission)', 'FDA (First Division Assistant)', 'SDA (Second Division Assistant)', 'Current Affairs', 'Banking Exams', 'Railway Exams', 'PDO (Panchayat Development Officer)', 'Others']
  };
  const [payload, setPayload] = useState({
    class_name: '',
    course: '',
    sub_category: '',
    subject: '',
    module: '',
    test_title: '',
    description: '',
    total_questions: 0,
    total_marks: 0,
    duration: 0,
    difficulty_level: 'Medium',
    pass_mark: 0,
    validity_days: 30,
    price: 0,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getAllTests();
      setItems((res.tests || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getAllTests();
        if (active) setItems((res.tests || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load tests');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let filteredItems = items;
    
    // Text search filter
    const q = query.trim().toLowerCase();
    if (q) {
      filteredItems = filteredItems.filter((it) =>
      [it.test_title, it.course, it.subject, it.module, it.difficulty_level]
        .some((v) => v.toLowerCase().includes(q))
    );
    }
    
    // Course filter
    if (filterCourse) {
      filteredItems = filteredItems.filter((it) => it.course === filterCourse);
    }
    
    // Sub-course filter
    if (filterSubCourse) {
      filteredItems = filteredItems.filter((it) => it.sub_category === filterSubCourse);
    }
    
    // Difficulty filter
    if (filterDifficulty) {
      filteredItems = filteredItems.filter((it) => it.difficulty_level === filterDifficulty);
    }
    
    return filteredItems;
  }, [items, query, filterCourse, filterSubCourse, filterDifficulty]);

  // Helper functions
  const clearFilters = () => {
    setQuery('');
    setFilterCourse('');
    setFilterSubCourse('');
    setFilterDifficulty('');
  };

  const resetQuestionForm = () => {
    setEditingQuestion(null);
    setQuestionImage(null);
    setDescriptionImages([]);
    setQuestionPayload({
      question: '',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
        { label: 'E', text: '' }
      ],
      correct_answer: '',
      explanation: '',
      marks: 1
    });
  };

  const openQuestionForm = (question?: any) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionPayload({
        question: question.question,
        options: question.options || [
          { label: 'A', text: '' },
          { label: 'B', text: '' },
          { label: 'C', text: '' },
          { label: 'D', text: '' },
          { label: 'E', text: '' }
        ],
        correct_answer: question.correct_answer,
        explanation: question.explanation || '',
        marks: question.marks
      });
      setQuestionImage(null); // Reset image for editing
      setDescriptionImages([]); // Reset description images for editing
    } else {
      resetQuestionForm();
    }
    setQuestionFormOpen(true);
    setQuestionsOpen(false); // Close the questions modal when opening question form
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionPayload.options];
    newOptions[index].text = value;
    setQuestionPayload({ ...questionPayload, options: newOptions });
  };

  const onSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedTest) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('test_id', selectedTest._id);
      formData.append('question_number', (questions.length + 1).toString());
      formData.append('question', questionPayload.question);
      formData.append('options', JSON.stringify(questionPayload.options));
      formData.append('correct_answer', questionPayload.correct_answer);
      formData.append('explanation', questionPayload.explanation || '');
      formData.append('marks', questionPayload.marks.toString());
      
      if (questionImage) {
        formData.append('image', questionImage);
      }

      // Add description images
      if (descriptionImages.length > 0) {
        descriptionImages.forEach((image) => {
          formData.append('description_images', image);
        });
      }

      if (editingQuestion) {
        // For editing, we need to handle this differently since we're using FormData
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.globaledutechlearn.com'}/test-questions/${editingQuestion._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to update question');
        }
      } else {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.globaledutechlearn.com'}/test-questions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to create question');
        }
      }
      
      setQuestionFormOpen(false);
      resetQuestionForm();
      await loadQuestions(selectedTest._id);
      
      // Reopen questions modal after adding/editing question
      setQuestionsOpen(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to save question');
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteQuestion = async (questionId: string) => {
    if (!token || !confirm('Delete this question?')) return;
    try {
      await ApiService.deleteQuestion(questionId, token);
      if (selectedTest) {
        await loadQuestions(selectedTest._id);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to delete question');
    }
  };

  const handleCourseChange = (course: string) => {
    setFilterCourse(course);
    setFilterSubCourse(''); // Reset sub-course when course changes
  };

  const handleSubCourseChange = (subCourse: string) => {
    setFilterSubCourse(subCourse);
  };

  const handleFormCourseChange = (course: string) => {
    setPayload({ ...payload, course, sub_category: '' }); // Reset sub_category when course changes
  };

  const handleFormSubCourseChange = (subCategory: string) => {
    setPayload({ ...payload, sub_category: subCategory });
  };

  const loadQuestions = async (testId: string) => {
    setQuestionsLoading(true);
    try {
      const res = await ApiService.getTestQuestions(testId);
      setQuestions(res.questions || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const openQuestions = (test: TestItem) => {
    setSelectedTest(test);
    setQuestionsOpen(true);
    loadQuestions(test._id);
  };

  const openFeedback = async (test: TestItem) => {
    setSelectedTest(test);
    setFeedbackOpen(true);
    setFeedbackLoading(true);
    try {
      const res = await ApiService.getTestById(test._id);
      if (res && res.test) {
        // Enrich feedback items with user name and contact_no
        const testFull: any = res.test;
        const feedback: any[] = (testFull.feedback || []) as any[];
        const uniqueUserIds = Array.from(new Set(
          feedback
            .map((fb: any) => (typeof fb.user_id === 'string' ? fb.user_id : fb.user_id?._id || ''))
            .filter((id: string) => !!id)
        ));

        const apiBase = (process.env.REACT_APP_API_URL || 'https://server.globaledutechlearn.com');
        const userMap: Record<string, { name?: string; contact_no?: string }> = {};
        await Promise.all(
          uniqueUserIds.map(async (uid) => {
            try {
              const resp = await fetch(`${apiBase}/users/${uid}`);
              if (resp.ok) {
                const data = await resp.json();
                const u = data.user || {};
                userMap[uid] = { name: u.name, contact_no: u.contact_no };
              }
            } catch {}
          })
        );

        testFull.feedback = feedback.map((fb: any) => {
          const uid = typeof fb.user_id === 'string' ? fb.user_id : fb.user_id?._id || '';
          const fromMap = uid ? userMap[uid] : undefined;
          return {
            ...fb,
            user_name: fb.user_name || fromMap?.name || 'Unknown',
            user_contact: fromMap?.contact_no || '',
          };
        });
        setSelectedTest(testFull);
      }
    } catch (e) {
      // keep existing selected test if fetch fails
    } finally {
      setFeedbackLoading(false);
    }
  };

  const resetForm = (): void => {
    setEditing(null);
    setPayload({
      class_name: '', course: '', sub_category: '', subject: '', module: '', test_title: '', description: '', total_questions: 0, total_marks: 0, duration: 0, difficulty_level: 'Medium', pass_mark: 0, validity_days: 30, price: 0,
    });
  };

  const openCreate = (): void => { resetForm(); setFormOpen(true); };
  const openEdit = (it: TestItem): void => {
    setEditing(it);
    setPayload({
      class_name: it.class_name,
      course: it.course,
      sub_category: it.sub_category || '',
      subject: it.subject,
      module: it.module,
      test_title: it.test_title,
      description: it.description,
      total_questions: it.total_questions,
      total_marks: it.total_marks,
      duration: it.duration,
      difficulty_level: it.difficulty_level,
      pass_mark: it.pass_mark,
      validity_days: it.validity_days || 30,
      price: it.price || 0,
    });
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateTest(editing._id, payload as any, token);
      } else {
        await ApiService.createTest(payload as any, token);
      }
      setFormOpen(false);
      resetForm();
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string): Promise<void> => {
    if (!token) { setError('Not authorized'); return; }
    if (!confirm('Delete this test?')) return;
    try {
      await ApiService.deleteTest(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-gray-600">Loading tests...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tests</h2>
            <p className="text-gray-600">Total: {items.length} | Showing: {filtered.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search tests" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Course</label>
            <select 
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={filterCourse} 
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              <option value="">All Courses</option>
              {Object.keys(courseCategories).map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Sub-Course</label>
            <select 
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={filterSubCourse} 
              onChange={(e) => handleSubCourseChange(e.target.value)}
              disabled={!filterCourse}
            >
              <option value="">All Sub-Courses</option>
              {filterCourse && courseCategories[filterCourse as keyof typeof courseCategories]?.map((subCourse) => (
                <option key={subCourse} value={subCourse}>{subCourse}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Difficulty</label>
            <select 
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={filterDifficulty} 
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              {difficultyLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={clearFilters}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setFormOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900 flex-shrink-0">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit Test' : 'Create Test'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Class Name</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Advanced" value={payload.class_name} onChange={(e) => setPayload({ ...payload, class_name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                  <select className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={payload.course} onChange={(e) => handleFormCourseChange(e.target.value)} required>
                    <option value="">Select Course</option>
                    {Object.keys(courseCategories).map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Course</label>
                  <select 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={payload.sub_category} 
                    onChange={(e) => handleFormSubCourseChange(e.target.value)}
                    disabled={!payload.course}
                    required
                  >
                    <option value="">Select Sub-Course</option>
                    {payload.course && courseCategories[payload.course as keyof typeof courseCategories]?.map((subCourse) => (
                      <option key={subCourse} value={subCourse}>{subCourse}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Biology" value={payload.subject} onChange={(e) => setPayload({ ...payload, subject: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Module</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Module 1" value={payload.module} onChange={(e) => setPayload({ ...payload, module: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Test Title</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Biology Hard Practice Test 1" value={payload.test_title} onChange={(e) => setPayload({ ...payload, test_title: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea className="border rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Test description..." value={payload.description} onChange={(e) => setPayload({ ...payload, description: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Questions</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={0} value={payload.total_questions} onChange={(e) => setPayload({ ...payload, total_questions: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Marks</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={0} value={payload.total_marks} onChange={(e) => setPayload({ ...payload, total_marks: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (minutes)</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={0} value={payload.duration} onChange={(e) => setPayload({ ...payload, duration: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty Level</label>
                  <select className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={payload.difficulty_level} onChange={(e) => setPayload({ ...payload, difficulty_level: e.target.value })} required>
                    {difficultyLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Pass Mark</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={0} value={payload.pass_mark} onChange={(e) => setPayload({ ...payload, pass_mark: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Validity (Days)</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={1} value={payload.validity_days} onChange={(e) => setPayload({ ...payload, validity_days: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={0} step="0.01" value={payload.price} onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} required />
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center justify-between pt-2">
                  <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course/Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{it.test_title}</div>
                    <div className="text-sm text-gray-500">{it.class_name} - {it.module}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{it.course}</div>
                  <div className="text-sm text-gray-600">{it.sub_category || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{it.subject}</div>
                  <div className="text-sm font-medium text-green-700 mt-1">₹ {it.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    it.difficulty_level === 'Easy' ? 'bg-green-100 text-green-800' :
                    it.difficulty_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {it.difficulty_level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.duration} mins</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.total_questions}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(it.updated_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button onClick={() => openQuestions(it)} className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs">View Questions</button>
                  <button onClick={() => openFeedback(it)} className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs">Feedback</button>
                  <button onClick={() => openEdit(it)} className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 text-xs">Edit</button>
                  <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Questions Modal */}
      {questionsOpen && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setQuestionsOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
              <div>
                <h3 className="text-xl font-bold text-white">Test Questions</h3>
                <p className="text-blue-200 text-sm">{selectedTest.test_title}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openQuestionForm()} 
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Add Question
                </button>
                <button className="text-yellow-400 hover:text-white" onClick={() => { setQuestionsOpen(false); }}>{'✕'}</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {questionsLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">Loading questions...</div>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">No questions found for this test.</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question) => (
                    <div key={question._id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {question.question_number}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-3">{question.question}</h4>
                          {question.image_url && (
                            <div className="mb-4">
                              <img 
                                src={`${process.env.REACT_APP_API_URL || 'https://server.globaledutechlearn.com'}/${question.image_url}`} 
                                alt="Question image" 
                                className="max-w-full h-auto max-h-64 rounded border"
                              />
                            </div>
                          )}
                          {question.description_images && question.description_images.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Description Images:</h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {question.description_images.map((imageUrl: string, imgIndex: number) => (
                                  <img 
                                    key={imgIndex}
                                    src={`${process.env.REACT_APP_API_URL || 'https://server.globaledutechlearn.com'}/${imageUrl}`} 
                                    alt={`Description image ${imgIndex + 1}`} 
                                    className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80"
                                    onClick={() => {
                                      // Open image in new tab for full view
                                      window.open(`${process.env.REACT_APP_API_URL || 'https://server.globaledutechlearn.com'}/${imageUrl}`, '_blank');
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            {question.options.map((option: any, optIndex: number) => (
                              option.text && ( // Only show options that have text
                                <div key={optIndex} className={`p-2 rounded border ${
                                  option.text === question.correct_answer 
                                    ? 'bg-green-100 border-green-300 text-green-800' 
                                    : 'bg-white border-gray-200'
                                }`}>
                                  <span className="font-medium">{option.label}.</span> {option.text}
                                  {option.text === question.correct_answer && (
                                    <span className="ml-2 text-green-600 font-bold">✓ Correct</span>
                                  )}
                                </div>
                              )
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                              <p className="text-sm text-blue-800">
                                <span className="font-semibold">Explanation:</span> {question.explanation}
                              </p>
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>Marks: {question.marks}</span>
                              <span>Difficulty: {question.difficulty_level}</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openQuestionForm(question)}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => onDeleteQuestion(question._id)}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question Form Modal */}
      {questionFormOpen && selectedTest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setQuestionFormOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900 flex-shrink-0">
              <h3 className="text-xl font-bold text-white">{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setQuestionFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={onSubmitQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Question</label>
                  <textarea 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 h-24" 
                    placeholder="Enter the question..."
                    value={questionPayload.question} 
                    onChange={(e) => setQuestionPayload({ ...questionPayload, question: e.target.value })} 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Question Image (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    onChange={(e) => setQuestionImage(e.target.files?.[0] || null)} 
                  />
                  {questionImage && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected: {questionImage.name}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description Images (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setDescriptionImages(files);
                    }} 
                  />
                  {descriptionImages.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected {descriptionImages.length} image(s):</p>
                      <ul className="text-xs text-gray-500 mt-1">
                        {descriptionImages.map((file, index) => (
                          <li key={index} className="truncate">• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {questionPayload.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="w-8 text-sm font-medium text-gray-600">{option.label}.</span>
                        <input 
                          className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                          placeholder={`Option ${option.label}${index === 4 ? ' (Optional)' : ''}`}
                          value={option.text} 
                          onChange={(e) => handleOptionChange(index, e.target.value)} 
                          required={index < 4} // Only A, B, C, D are required
                        />
                        <input 
                          type="radio" 
                          name="correct_answer" 
                          value={option.text}
                          checked={questionPayload.correct_answer === option.text}
                          onChange={(e) => setQuestionPayload({ ...questionPayload, correct_answer: e.target.value })}
                          className="w-4 h-4 text-green-600"
                          disabled={!option.text} // Disable if option is empty
                        />
                        <span className="text-sm text-gray-600">Correct</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Note: Options A-D are required, Option E is optional</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Explanation (Optional)</label>
                  <textarea 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 h-20" 
                    placeholder="Explanation for the correct answer..."
                    value={questionPayload.explanation} 
                    onChange={(e) => setQuestionPayload({ ...questionPayload, explanation: e.target.value })} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Marks</label>
                  <input 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    type="number" 
                    min="1" 
                    value={questionPayload.marks} 
                    onChange={(e) => setQuestionPayload({ ...questionPayload, marks: Number(e.target.value) })} 
                    required 
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setQuestionFormOpen(false); 
                      resetQuestionForm(); 
                      setQuestionsOpen(true); // Reopen questions modal
                    }} 
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
                    </button>
                    {!editingQuestion && (
                      <button 
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!token || !selectedTest) return;
                          
                          setSubmitting(true);
                          try {
                            const formData = new FormData();
                            formData.append('test_id', selectedTest._id);
                            formData.append('question_number', (questions.length + 1).toString());
                            formData.append('question', questionPayload.question);
                            formData.append('options', JSON.stringify(questionPayload.options));
                            formData.append('correct_answer', questionPayload.correct_answer);
                            formData.append('explanation', questionPayload.explanation || '');
                            formData.append('marks', questionPayload.marks.toString());
                            
                            if (questionImage) {
                              formData.append('image', questionImage);
                            }

                            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.globaledutechlearn.com'}/test-questions`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              },
                              body: formData
                            });
                            
                            if (!response.ok) {
                              throw new Error('Failed to create question');
                            }
                            
                            resetQuestionForm();
                            await loadQuestions(selectedTest._id);
                          } catch (e: any) {
                            setError(e?.message || 'Failed to save question');
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        disabled={submitting}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting ? 'Saving...' : 'Add & Continue'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOpen && selectedTest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50" onClick={() => { setFeedbackOpen(false); }}>
          <div className="w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 bg-blue-900 flex items-center justify-between border-b border-blue-700">
              <div>
                <h3 className="text-lg font-bold text-white">Feedback</h3>
                <p className="text-blue-200 text-sm">{selectedTest.test_title}</p>
              </div>
              <button 
                className="text-yellow-400 hover:text-white text-xl font-bold" 
                onClick={() => { setFeedbackOpen(false); }}
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {feedbackLoading ? (
                <div className="text-gray-600">Loading feedback...</div>
              ) : selectedTest.feedback && (selectedTest as any).feedback.length > 0 ? (
                <div className="space-y-3">
                  {(selectedTest as any).feedback.map((fb: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-semibold text-gray-800">Rating: {fb.rating}/5</div>
                        <div className="text-xs text-gray-500">{fb.created_at ? new Date(fb.created_at).toLocaleString() : ''}</div>
                      </div>
                      <div className="text-sm text-gray-800">
                        <span className="font-medium">Name:</span> {fb.user_name || 'Unknown'}
                        {fb.user_contact && (
                          <span className="ml-3"><span className="font-medium">Contact:</span> {fb.user_contact}</span>
                        )}
                      </div>
                      {fb.comment && <p className="text-sm text-gray-700 mt-2">{fb.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600">No feedback yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;


