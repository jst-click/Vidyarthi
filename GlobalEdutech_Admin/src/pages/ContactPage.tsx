import React, { useEffect, useState } from 'react';
import ApiService, { type ContactItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const ContactPage: React.FC = () => {
  const { token } = useAuth();
  const [item, setItem] = useState<ContactItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ContactItem>>({
    company_name: '',
    address: '',
    phone: '',
    mobile: '',
    email: '',
    website: '',
    working_hours: '',
    emergency_contact: '',
    social_media: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Email validation - only if email is provided and not empty
    if (form.email && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Phone validation - only if phone is provided and not empty
    if (form.phone && form.phone.trim()) {
      const cleanPhone = form.phone.replace(/[\s\-\(\)\.]/g, '');
      const phoneRegex = /^[\+]?[1-9][\d]{7,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Please enter a valid phone number (8-15 digits)';
      }
    }
    
    // Mobile validation - only if mobile is provided and not empty
    if (form.mobile && form.mobile.trim()) {
      const cleanMobile = form.mobile.replace(/[\s\-\(\)\.]/g, '');
      const phoneRegex = /^[\+]?[1-9][\d]{7,15}$/;
      if (!phoneRegex.test(cleanMobile)) {
        errors.mobile = 'Please enter a valid mobile number (8-15 digits)';
      }
    }
    
    // Website validation - only if website is provided and not empty
    if (form.website && form.website.trim()) {
      const websiteRegex = /^https?:\/\/.+/;
      if (!websiteRegex.test(form.website.trim())) {
        errors.website = 'Please enter a valid website URL (starting with http:// or https://)';
      }
    }
    
    // Social media URL validation
    if (form.social_media) {
      Object.entries(form.social_media).forEach(([platform, url]) => {
        if (url && url.trim()) {
          const urlRegex = /^https?:\/\/.+/;
          if (!urlRegex.test(url.trim())) {
            errors[`social_${platform}`] = `Please enter a valid ${platform} URL (starting with http:// or https://)`;
          }
        }
      });
    }
    
    console.log('Validation errors:', errors);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ContactItem, value: string) => {
    setForm({ ...form, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setForm({
      ...form,
      social_media: {
        ...form.social_media,
        [platform]: value
      }
    });
    const errorKey = `social_${platform}`;
    if (validationErrors[errorKey]) {
      setValidationErrors({ ...validationErrors, [errorKey]: '' });
    }
  };

  useEffect(() => {
    (async () => {
      try { 
        const res = await ApiService.getContact(); 
        setItem(res.contact); 
        // Initialize form with contact data
        const formData = {
          company_name: res.contact?.company_name || '',
          address: res.contact?.address || '',
          phone: res.contact?.phone || '',
          mobile: res.contact?.mobile || '',
          email: res.contact?.email || '',
          website: res.contact?.website || '',
          working_hours: res.contact?.working_hours || '',
          emergency_contact: res.contact?.emergency_contact || '',
          social_media: {
            facebook: res.contact?.social_media?.facebook || '',
            twitter: res.contact?.social_media?.twitter || '',
            instagram: res.contact?.social_media?.instagram || '',
            linkedin: res.contact?.social_media?.linkedin || ''
          }
        };
        console.log('Initializing form with data:', formData); // Debug log
        setForm(formData);
      }
      catch (e: any) { setError(e?.message || 'Failed to load'); }
      finally { setLoading(false); }
    })();
  }, []);

  // Debug form state changes
  useEffect(() => {
    console.log('Form state changed:', form); // Debug log
  }, [form]);

  const onSave = async (): Promise<void> => {
    if (!token || !item) { setError('Not authorized'); return; }
    
    console.log('Form data before validation:', form); // Debug log
    
    if (!validateForm()) {
      console.log('Validation errors:', validationErrors); // Debug log
      setError('Please fix the validation errors before saving');
      return;
    }
    
    setSaving(true);
    setError(null);
    try { 
      console.log('Saving contact with data:', form); // Debug log
      await ApiService.updateContact(item._id, form, token);
      setItem({ ...item, ...form });
    }
    catch (e: any) { 
      console.error('Save error:', e); // Debug log
      setError(e?.message || 'Save failed'); 
    }
    finally { setSaving(false); }
  };

  const resetForm = () => {
    if (item) {
      setForm({
        company_name: item.company_name || '',
        address: item.address || '',
        phone: item.phone || '',
        mobile: item.mobile || '',
        email: item.email || '',
        website: item.website || '',
        working_hours: item.working_hours || '',
        emergency_contact: item.emergency_contact || '',
        social_media: {
          facebook: item.social_media?.facebook || '',
          twitter: item.social_media?.twitter || '',
          instagram: item.social_media?.instagram || '',
          linkedin: item.social_media?.linkedin || ''
        }
      });
      setValidationErrors({});
      setError(null);
    }
  };

  if (loading) return <div className="text-gray-600">Loading contact...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            <p className="text-gray-600">Manage your organization's contact details</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={resetForm} 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Reset
            </button>
            <button 
              onClick={onSave} 
              disabled={saving} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name 
              </label>
              <input 
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
                value={form.company_name || ''} 
                onChange={(e) => handleInputChange('company_name', e.target.value)}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address 
              </label>
              <textarea 
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your organization's address"
                value={form.address || ''} 
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
              />
              {validationErrors.address && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Working Hours 
              </label>
              <input 
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Monday - Saturday: 9:00 AM - 7:00 PM"
                value={form.working_hours || ''} 
                onChange={(e) => handleInputChange('working_hours', e.target.value)}
              />
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number 
              </label>
              <input 
                type="tel"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter phone number (e.g., +1 234 567 8900)"
                value={form.phone || ''} 
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              {validationErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number 
              </label>
              <input 
                type="tel"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.mobile ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter mobile number (e.g., +91-98765-43210)"
                value={form.mobile || ''} 
                onChange={(e) => handleInputChange('mobile', e.target.value)}
              />
              {validationErrors.mobile && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.mobile}</p>
              )}
            </div>
          </div>

          {/* Email and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address 
              </label>
              <input 
                type="email"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter email address (e.g., contact@example.com)"
                value={form.email || ''} 
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website 
              </label>
              <input 
                type="url"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.website ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter website URL (e.g., https://example.com)"
                value={form.website || ''} 
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
              {validationErrors.website && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.website}</p>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Emergency Contact 
              </label>
              <input 
                type="tel"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter emergency contact number"
                value={form.emergency_contact || ''} 
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
              />
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Facebook 
                </label>
                <input 
                  type="url"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.social_facebook ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="https://facebook.com/yourpage"
                  value={form.social_media?.facebook || ''} 
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                />
                {validationErrors.social_facebook && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.social_facebook}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Youtube 
                </label>
                <input 
                  type="url"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.social_twitter ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="https://youtube.com/yourhandle"
                  value={form.social_media?.twitter || ''} 
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                />
                {validationErrors.social_twitter && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.social_twitter}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instagram 
                </label>
                <input 
                  type="url"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.social_instagram ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="https://instagram.com/yourhandle"
                  value={form.social_media?.instagram || ''} 
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                />
                {validationErrors.social_instagram && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.social_instagram}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Whatsapp 
                </label>
                <input 
                  type="url"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.social_linkedin ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="https://whatsapp.com/company/yourcompany"
                  value={form.social_media?.linkedin || ''} 
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                />
                {validationErrors.social_linkedin && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.social_linkedin}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep your contact information up to date for better user experience</li>
            <li>• Email and phone are optional but recommended for user inquiries</li>
            <li>• Address helps users locate your organization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

